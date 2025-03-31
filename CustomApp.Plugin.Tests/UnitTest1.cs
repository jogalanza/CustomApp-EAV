using CustomApp.PluginSDK;
using Moq;

namespace CustomApp.Plugin.Tests
{
    class MockFilterRegistry : IFilterRegistry
    {
        private readonly Dictionary<string, Func<object, IDictionary<string, object>, object>> _filters = new();
        public void AddFilter(string name, Func<object, IDictionary<string, object>, object> filter) => _filters[name] = filter;
        public object ApplyFilter(string name, object input) => _filters[name](input, null);
    }
    public class UnitTest1
    {
        [Fact]
        public void Test1()
        {
            //var host = new Mock<IPluginHost>();
            //var plugin = new SamplePlugin();
            //plugin.Initialize(host.Object);

            //var registry = new MockFilterRegistry();
            //plugin.RegisterFilters(registry);

            //var result = registry.ApplyFilter("content.modify", "Test");
            //Assert.Equal("Test [Modified by SamplePlugin]", result);
        }
    }
}