using CustomApp.Model;
using CustomApp.PluginSDK;
using Microsoft.AspNetCore.Http;

namespace Plugin.Default
{
    public class DefaultCustomAppPlugin : IPlugin
    {
        private IPluginHost _host;
        public string Name => "SamplePlugin";
        

        public void Initialize(IPluginHost host)
        {
            _host = host;
        }

        public void RegisterActions(IActionRegistry registry)
        {
            registry.AddAction("add-menu", args =>
            {
                Console.WriteLine("Add-menu action triggered from SamplePlugin!");
                return new List<CustomMenuItem>
                {
                    new CustomMenuItem { Name = "Sample Menu", Path = "/sample", Icon = "mdi-home" },
                    new CustomMenuItem { Name = "Settings", Path = "/sample/settings", Icon = "mdi-cog" }
                };
            });
        }

        public void RegisterFilters(IFilterRegistry registry)
        {
            registry.AddFilter("modify-table-name", (input, args) =>
            {
                if (input is string tableName)
                {
                    Console.WriteLine($"Filter: Modifying table name '{tableName}'");
                    return $"{tableName}_SamplePlugin";
                }
                return input;
            });
        }

        public void RegisterRoutes(IRouteRegistry registry)
        {
            registry.AddRoute("/api/sample/hello", async context =>
            {
                await context.Response.WriteAsync("Hello World!"); // Breakpoint here
            });
        }

        public void RegisterWidgets(IWidgetRegistry registry)
        {
            registry.AddWidget("sample-remote-component", new
            {
                Name = "RemoteComponent",
                RemoteUrl = "http://localhost:5001/assets/remoteEntry.js"
            });
        }
    }
}
