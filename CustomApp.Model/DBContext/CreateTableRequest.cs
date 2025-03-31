using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CustomApp.Model.DBContext
{
    public class CreateTableRequest
    {
        public string? TableName { get; set; }
        public Dictionary<string, string> Fields { get; set; } // FieldName -> FieldType
        public Dictionary<string, Dictionary<string, string>> FieldMetadata { get; set; } // FieldName -> MetadataKey/Value
    }
}
