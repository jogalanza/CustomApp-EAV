using Dapper;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CustomApp.Services.DataContext
{
    public interface IDbInitializer
    {
        Task InitializeAsync();
    }
    public class DbInitializer : IDbInitializer
    {
        private readonly IDbConnection _db;
        private readonly string _connectionString;

        public DbInitializer(IConfiguration configuration) =>
        _connectionString = configuration.GetConnectionString("DefaultConnection");

        public async Task InitializeAsync()
        {
            using var masterDb = new SqlConnection(_connectionString.Replace("Database=CustomAppEVE", "Database=master"));
            await masterDb.ExecuteAsync(
                "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CustomAppEVE') CREATE DATABASE CustomAppEVE;");

            using var db = new SqlConnection(_connectionString);

            await db.ExecuteAsync(@"
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Entities')
                BEGIN
                    CREATE TABLE Entities (
                        EntityId INT IDENTITY(1,1) PRIMARY KEY,
                        TableName NVARCHAR(100) NOT NULL UNIQUE,
                        CreatedDate DATETIME DEFAULT GETDATE()
                    );
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Attributes')
                BEGIN
                    CREATE TABLE Attributes (
                        AttributeId INT IDENTITY(1,1) PRIMARY KEY,
                        EntityId INT NOT NULL,
                        FieldName NVARCHAR(100) NOT NULL,
                        FieldType NVARCHAR(50) NOT NULL,
                        CONSTRAINT FK_Attributes_Entities FOREIGN KEY (EntityId) 
                            REFERENCES Entities(EntityId) ON DELETE CASCADE,
                        CONSTRAINT UQ_Attributes_EntityId_FieldName UNIQUE (EntityId, FieldName)
                    );
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EntityRow')
                BEGIN
                    CREATE TABLE EntityRow (
                        RowId INT IDENTITY(1,1) PRIMARY KEY,
                        EntityId INT NOT NULL,
                        CreatedDate DATETIME DEFAULT GETDATE(),
                        CONSTRAINT FK_EntityRow_Entities FOREIGN KEY (EntityId) 
                            REFERENCES Entities(EntityId) ON DELETE CASCADE
                    );
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EntityRowValue')
                BEGIN
                    CREATE TABLE EntityRowValue (
                        RowId INT NOT NULL,
                        AttributeId INT NOT NULL,
                        ValueString NVARCHAR(MAX) NULL,
                        ValueInt INT NULL,
                        ValueDecimal DECIMAL(18,6) NULL,
                        ValueDateTime DATETIME NULL,
                        IsLargeObject BIT NOT NULL DEFAULT 0,
                        CONSTRAINT PK_EntityRowValue PRIMARY KEY (RowId, AttributeId),
                        CONSTRAINT FK_EntityRowValue_EntityRow FOREIGN KEY (RowId) 
                            REFERENCES EntityRow(RowId) ON DELETE CASCADE,
                        CONSTRAINT FK_EntityRowValue_Attributes FOREIGN KEY (AttributeId) 
                            REFERENCES Attributes(AttributeId)
                    );
                END

                -- Create indexes if they don’t exist
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EntityRow_EntityId' AND object_id = OBJECT_ID('EntityRow'))
                    CREATE NONCLUSTERED INDEX IX_EntityRow_EntityId ON EntityRow (EntityId);

                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EntityRowValue_RowId' AND object_id = OBJECT_ID('EntityRowValue'))
                    CREATE NONCLUSTERED INDEX IX_EntityRowValue_RowId ON EntityRowValue (RowId);

                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EntityRowValue_AttributeId' AND object_id = OBJECT_ID('EntityRowValue'))
                    CREATE NONCLUSTERED INDEX IX_EntityRowValue_AttributeId ON EntityRowValue (AttributeId);

                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Attributes_EntityId' AND object_id = OBJECT_ID('Attributes'))
                    CREATE NONCLUSTERED INDEX IX_Attributes_EntityId ON Attributes (EntityId);
            ");
        }
    }
}
