using CustomApp.Model;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CustomApp.Services.DataContext
{
    public interface IEavService
    {
        Task<int> CreateTableAsync(string tableName, Dictionary<string, string> fields, Dictionary<string, Dictionary<string, string>> fieldMetadata = null);
        Task<int> AddRowAsync(int entityId, Dictionary<string, object> values);
        Task UpdateRowAsync(int rowId, Dictionary<string, object> values);
        Task<List<Dictionary<string, object>>> GetRowsAsync(int entityId);
        Task<List<dynamic>> GetRowsDynamicAsync(int entityId, int page, int pageSize, string whereClause = null, string orderBy = null, bool includeLargeObjects = true);
        Task<List<(int AttributeId, string FieldName, string FieldType, Dictionary<string, string> Metadata)>> GetTableFieldsAsync(int entityId);
        Task DeleteRowAsync(int rowId);
        Task DeleteTableAsync(int entityId);
    }
    public class DapperEavService : IEavService
    {
        private readonly IDbConnection _db;
        private const long MaxBase64Size = 1L * 1024 * 1024 * 1024; // 1 GB

        public DapperEavService(IDbConnection db) => _db = db;

        public async Task<int> CreateTableAsync(string tableName, Dictionary<string, string> fields, Dictionary<string, Dictionary<string, string>> fieldMetadata = null)
        {
            int entityId = await _db.ExecuteScalarAsync<int>(
                "INSERT INTO Entities (TableName) VALUES (@TableName); SELECT CAST(SCOPE_IDENTITY() AS INT);",
                new { TableName = tableName });

            foreach (var field in fields)
            {
                int attributeId = await _db.ExecuteScalarAsync<int>(
                    "INSERT INTO Attributes (EntityId, FieldName, FieldType) VALUES (@EntityId, @FieldName, @FieldType); SELECT CAST(SCOPE_IDENTITY() AS INT);",
                    new { EntityId = entityId, FieldName = field.Key, FieldType = field.Value });

                if (fieldMetadata?.ContainsKey(field.Key) == true)
                {
                    int metadataEntityId = await GetOrCreateMetadataTableAsync();
                    int metadataRowId = await AddRowAsync(metadataEntityId, new Dictionary<string, object>());
                    foreach (var meta in fieldMetadata[field.Key])
                    {
                        await SetFieldValueAsync(metadataRowId, $"Field_{attributeId}_{meta.Key}", meta.Value, "String");
                    }
                }
            }
            return entityId;
        }

        public async Task<int> AddRowAsync(int entityId, Dictionary<string, object> values)
        {
            int rowId = await _db.ExecuteScalarAsync<int>(
                "INSERT INTO EntityRow (EntityId) VALUES (@EntityId); SELECT CAST(SCOPE_IDENTITY() AS INT);",
                new { EntityId = entityId });

            await UpdateRowAsync(rowId, values);
            return rowId;
        }

        public async Task UpdateRowAsync(int rowId, Dictionary<string, object> values)
        {
            var fields = await _db.QueryAsync<(int AttributeId, string FieldName, string FieldType)>(
                "SELECT AttributeId, FieldName, FieldType FROM Attributes WHERE EntityId = (SELECT EntityId FROM EntityRow WHERE RowId = @RowId)",
                new { RowId = rowId });

            foreach (var value in values)
            {
                var field = fields.FirstOrDefault(f => f.FieldName == value.Key);
                if (field.AttributeId == 0) continue;

                string fieldType = field.FieldType;
                object fieldValue = value.Value;
                bool isLargeObject = fieldType == "String" && fieldValue is string str && Encoding.UTF8.GetByteCount(str) > 1024 * 1024;

                if (fieldType == "String" && fieldValue is string base64Str)
                {
                    long size = Encoding.UTF8.GetByteCount(base64Str);
                    if (size > MaxBase64Size)
                        throw new ArgumentException($"ValueString for field '{value.Key}' exceeds 1 GB limit ({size} bytes).");
                }

                await SetFieldValueAsync(rowId, field.FieldName, fieldValue, fieldType, isLargeObject);
            }
        }

        public async Task<List<Dictionary<string, object>>> GetRowsAsync(int entityId)
        {
            var rows = await _db.QueryAsync<(int RowId, int AttributeId, string FieldName, string ValueString, int? ValueInt, decimal? ValueDecimal, DateTime? ValueDateTime)>(
                @"
            SELECT er.RowId, a.AttributeId, a.FieldName, erv.ValueString, erv.ValueInt, erv.ValueDecimal, erv.ValueDateTime
            FROM EntityRow er
            LEFT JOIN EntityRowValue erv ON er.RowId = erv.RowId
            LEFT JOIN Attributes a ON erv.AttributeId = a.AttributeId
            WHERE er.EntityId = @EntityId",
                new { EntityId = entityId });

            var result = new Dictionary<int, Dictionary<string, object>>();
            foreach (var row in rows)
            {
                if (!result.ContainsKey(row.RowId))
                    result[row.RowId] = new Dictionary<string, object>();
                result[row.RowId][row.FieldName] = row.ValueString ?? (object)row.ValueInt ?? (object)row.ValueDecimal ?? row.ValueDateTime;
            }
            return result.Values.ToList();
        }

        public async Task<List<dynamic>> GetRowsDynamicAsync(int entityId, int page, int pageSize, string whereClause = null, string orderBy = null, bool includeLargeObjects = true)
        {
            var sql = new StringBuilder(
                @"
            WITH RowsCTE AS (
                SELECT er.RowId, er.EntityId, a.AttributeId, a.FieldName, a.FieldType,
                       erv.ValueString, erv.ValueInt, erv.ValueDecimal, erv.ValueDateTime, erv.IsLargeObject
                FROM EntityRow er
                LEFT JOIN EntityRowValue erv ON er.RowId = erv.RowId
                LEFT JOIN Attributes a ON erv.AttributeId = a.AttributeId
                WHERE er.EntityId = @EntityId"
            );

            if (!string.IsNullOrWhiteSpace(whereClause))
                sql.Append($" AND {whereClause}");

            if (!includeLargeObjects)
                sql.Append(" AND (erv.IsLargeObject = 0 OR erv.IsLargeObject IS NULL)");

            sql.Append(
                @")
            SELECT RowId, EntityId, FieldName, 
                   CASE 
                       WHEN FieldType = 'String' THEN ValueString
                       WHEN FieldType = 'Int' THEN CAST(ValueInt AS NVARCHAR(MAX))
                       WHEN FieldType = 'Decimal' THEN CAST(ValueDecimal AS NVARCHAR(MAX))
                       WHEN FieldType = 'DateTime' THEN CAST(ValueDateTime AS NVARCHAR(MAX))
                   END AS Value
            FROM RowsCTE"
            );

            if (!string.IsNullOrWhiteSpace(orderBy))
                sql.Append($" ORDER BY {orderBy}");
            else
                sql.Append(" ORDER BY RowId");

            sql.Append(" OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY");

            var rows = await _db.QueryAsync<dynamic>(sql.ToString(), new
            {
                EntityId = entityId,
                Offset = (page - 1) * pageSize,
                PageSize = pageSize
            });

            var result = new Dictionary<int, dynamic>();
            foreach (var row in rows)
            {
                if (!result.ContainsKey(row.RowId))
                    result[row.RowId] = new ExpandoObject();
                var dict = (IDictionary<string, object>)result[row.RowId];
                dict["EntityId"] = row.EntityId;
                dict["RowId"] = row.RowId;
                dict[row.FieldName] = row.Value;
            }
            return result.Values.ToList();
        }

        public async Task<List<(int AttributeId, string FieldName, string FieldType, Dictionary<string, string> Metadata)>> GetTableFieldsAsync(int entityId)
        {
            var fields = await _db.QueryAsync<(int AttributeId, string FieldName, string FieldType)>(
                "SELECT AttributeId, FieldName, FieldType FROM Attributes WHERE EntityId = @EntityId",
                new { EntityId = entityId });

            var result = new List<(int, string, string, Dictionary<string, string>)>();
            int metadataEntityId = await GetOrCreateMetadataTableAsync();

            foreach (var field in fields)
            {
                var metadata = await _db.QueryAsync<(string FieldName, string ValueString)>(
                    @"
                SELECT SUBSTRING(a.FieldName, CHARINDEX('_', a.FieldName, CHARINDEX('_', a.FieldName) + 1) + 1, LEN(a.FieldName)) AS FieldName,
                       erv.ValueString
                FROM EntityRowValue erv
                JOIN Attributes a ON erv.AttributeId = a.AttributeId
                WHERE a.EntityId = @MetadataEntityId AND a.FieldName LIKE 'Field_' + CAST(@AttributeId AS NVARCHAR(10)) + '_%'",
                    new { MetadataEntityId = metadataEntityId, AttributeId = field.AttributeId });

                result.Add((field.AttributeId, field.FieldName, field.FieldType, metadata.ToDictionary(m => m.FieldName, m => m.ValueString)));
            }
            return result;
        }

        public async Task DeleteRowAsync(int rowId)
        {
            await _db.ExecuteAsync("DELETE FROM EntityRow WHERE RowId = @RowId", new { RowId = rowId });
        }

        public async Task DeleteTableAsync(int entityId)
        {
            await _db.ExecuteAsync("DELETE FROM Entities WHERE EntityId = @EntityId", new { EntityId = entityId });
        }

        private async Task<int> GetOrCreateMetadataTableAsync()
        {
            var entityId = await _db.ExecuteScalarAsync<int?>(
                "SELECT EntityId FROM Entities WHERE TableName = 'FieldMetadata'");
            if (entityId.HasValue) return entityId.Value;

            return await CreateTableAsync("FieldMetadata", new Dictionary<string, string>());
        }

        private async Task SetFieldValueAsync(int rowId, string fieldName, object value, string fieldType, bool isLargeObject = false)
        {
            var attributeId = await _db.ExecuteScalarAsync<int>(
                "SELECT AttributeId FROM Attributes WHERE EntityId = (SELECT EntityId FROM EntityRow WHERE RowId = @RowId) AND FieldName = @FieldName",
                new { RowId = rowId, FieldName = fieldName });

            await _db.ExecuteAsync(
                @"
            MERGE EntityRowValue AS target
            USING (SELECT @RowId AS RowId, @AttributeId AS AttributeId) AS source
            ON (target.RowId = source.RowId AND target.AttributeId = source.AttributeId)
            WHEN MATCHED THEN
                UPDATE SET ValueString = @ValueString, ValueInt = @ValueInt, ValueDecimal = @ValueDecimal, ValueDateTime = @ValueDateTime, IsLargeObject = @IsLargeObject
            WHEN NOT MATCHED THEN
                INSERT (RowId, AttributeId, ValueString, ValueInt, ValueDecimal, ValueDateTime, IsLargeObject)
                VALUES (@RowId, @AttributeId, @ValueString, @ValueInt, @ValueDecimal, @ValueDateTime, @IsLargeObject);",
                new
                {
                    RowId = rowId,
                    AttributeId = attributeId,
                    ValueString = fieldType == "String" ? value?.ToString() : null,
                    ValueInt = fieldType == "Int" ? (int?)value : null,
                    ValueDecimal = fieldType == "Decimal" ? (decimal?)value : null,
                    ValueDateTime = fieldType == "DateTime" ? (DateTime?)value : null,
                    IsLargeObject = isLargeObject
                });
        }
    }
}
