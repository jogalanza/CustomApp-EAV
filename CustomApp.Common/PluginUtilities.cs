using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CustomApp.Common
{
    public static class PluginUtilities
    {
        public static string NormalizeName(string name) => name.Trim().ToLowerInvariant();
    }
}
