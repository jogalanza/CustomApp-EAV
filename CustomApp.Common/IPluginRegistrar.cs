using CustomApp.PluginSDK;

namespace CustomApp.Common
{
    public interface IPluginRegistrar
    {
        void RegisterPlugin(IPlugin plugin);
    }
}
