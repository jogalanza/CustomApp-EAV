namespace CustomApp.PluginSDK
{
    public interface IPlugin
    {
        string Name { get; }
        void Initialize(IPluginHost host);
        void RegisterFilters(IFilterRegistry registry);
        void RegisterActions(IActionRegistry registry);
        void RegisterRoutes(IRouteRegistry registry);
        void RegisterWidgets(IWidgetRegistry registry);
    }
}
