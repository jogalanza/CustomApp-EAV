using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CustomApp.Model
{
    public class Entity
    {
        public int Id { get; set; }
        public string? Type { get; set; }
        public Dictionary<string, string> Attributes { get; set; } = new();
    }
}
