using CustomApp.Common;
using CustomApp.PluginSDK;
using System;
using System.Reflection;

namespace CustomApp.Host
{
    public class PluginManager : IPluginRegistrar, IPluginHost
    {
        private readonly IServiceProvider _services;
        private readonly Dictionary<string, IPlugin> _plugins = new();
        private readonly Dictionary<string, List<Func<object, IDictionary<string, object>, object>>> _filters = new();
        private readonly Dictionary<string, Func<HttpContext, Task>> _routes = new();
        private readonly Dictionary<string, Func<IDictionary<string, object>, object>> _actions = new();

        public PluginManager(IServiceProvider services) => _services = services;

        public T GetService<T>()
        {
            using var scope = _services.CreateScope();
            return scope.ServiceProvider.GetService<T>();
        }

        public object ApplyFilters(string filterName, object input, IDictionary<string, object> args = null)
        {
            if (!_filters.ContainsKey(filterName)) return input;
            return _filters[filterName].Aggregate(input, (current, filter) => filter(current, args));
        }

        public void LoadPluginsFromDirectory(string directory)
        {
            foreach (var folder in Directory.GetDirectories(directory))
            {
                LoadPluginFromFolder(folder);
            }
        }

        public void LoadPluginFromFolder(string pluginFolderPath)
        {
            var dllFiles = Directory.GetFiles(pluginFolderPath, "*.dll", SearchOption.TopDirectoryOnly);
            foreach (var dll in dllFiles)
            {
                try
                {
                    var assembly = Assembly.LoadFrom(dll);
                    var pluginTypes = assembly.GetTypes().Where(t => typeof(IPlugin).IsAssignableFrom(t) && !t.IsAbstract);
                    foreach (var type in pluginTypes)
                    {
                        var plugin = (IPlugin)Activator.CreateInstance(type);
                        RegisterPlugin(plugin);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to load plugin from {dll}: {ex.Message}");
                }
            }
        }

        // Expose routes for mapping in the host app
        public IReadOnlyDictionary<string, Func<HttpContext, Task>> GetRegisteredRoutes() => _routes;

        // Internal registry implementation for routes
        private class RouteRegistry : IRouteRegistry
        {
            private readonly Dictionary<string, Func<HttpContext, Task>> _routes;

            public RouteRegistry(Dictionary<string, Func<HttpContext, Task>> routes) => _routes = routes;

            public void AddRoute(string path, Func<HttpContext, Task> handler)
            {
                _routes[path] = handler;
            }
        }

        private class ActionRegistry : IActionRegistry
        {
            private readonly Dictionary<string, Func<IDictionary<string, object>, object>> _actions;
            public ActionRegistry(Dictionary<string, Func<IDictionary<string, object>, object>> actions) => _actions = actions;

            public void AddAction(string name, Func<IDictionary<string, object>, object> handler)
            {
                _actions[name] = handler;
            }

            public object ExecuteAction(string name, IDictionary<string, object> args)
            {
                return _actions.ContainsKey(name) ? _actions[name](args) : null;
            }
        }

        // Pass the route registry to plugins during initialization
        public void RegisterPlugin(IPlugin plugin)
        {
            _plugins[plugin.Name] = plugin;
            plugin.Initialize(this);
            plugin.RegisterRoutes(new RouteRegistry(_routes));
            plugin.RegisterActions(new ActionRegistry(_actions));
            // Other registrations (filters, actions, widgets) omitted for brevity
        }
    }
}
