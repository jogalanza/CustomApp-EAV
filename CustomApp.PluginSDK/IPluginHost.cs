using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CustomApp.PluginSDK
{
    public interface IPluginHost
    {
        T GetService<T>();
        object ApplyFilters(string filterName, object input, IDictionary<string, object> args = null);
    }
}
