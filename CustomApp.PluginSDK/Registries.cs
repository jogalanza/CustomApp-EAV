using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CustomApp.PluginSDK
{
    public interface IFilterRegistry { 
        void AddFilter(string name, Func<object, IDictionary<string, object>, object> filter); 
    }
    public interface IActionRegistry { 
        void AddAction(string name, Func<IDictionary<string, object>, object> handler);
        object ExecuteAction(string name, IDictionary<string, object> args);
    }
    public interface IRouteRegistry { void AddRoute(string path, Func<HttpContext, Task> handler); }
    public interface IWidgetRegistry { void AddWidget(string name, object vueComponentPath); }
}
