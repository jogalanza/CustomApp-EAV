using CustomApp.Common;
using CustomApp.Host;
using CustomApp.PluginSDK;
using CustomApp.Services.DataContext;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.FileProviders;
using Plugin.Default;
using System.Data;
using System.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddSingleton<IPluginRegistrar, PluginManager>();
builder.Services.AddScoped<IPluginHost, PluginManager>();

builder.Services.AddScoped<IDbConnection>(_ =>
    new SqlConnection("Server=localhost;Database=PluginAppDb;Trusted_Connection=True;"));
builder.Services.AddSingleton<IDbInitializer, DbInitializer>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()    // Allows all origins (*)
              .AllowAnyMethod()    // Allows all HTTP methods (GET, POST, etc.)
              .AllowAnyHeader();   // Allows all headers
    });
});


var app = builder.Build();

// Enable CORS middleware
app.UseCors("AllowAll");

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

var forwardedHeaderOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
    ForwardLimit = 1
};
forwardedHeaderOptions.KnownNetworks.Clear(); // Allows for any proxy, optional
forwardedHeaderOptions.KnownProxies.Clear();  // Allows for any proxy, optional

app.UseForwardedHeaders(forwardedHeaderOptions);

app.UseHttpsRedirection();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")),
    RequestPath = "" // Serve at root (/)
});
//app.UseStaticFiles(); // Serve wwwroot
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "Plugins")),
    RequestPath = "/Plugins" // Map /Plugins to Plugins folder
});

app.UseRouting();

//app.UseAuthorization();

//app.MapRazorPages();

// Initialize database schema and load plugins
var initializer = app.Services.GetService<IDbInitializer>();
await initializer.InitializeAsync();

// Trigger initial plugin loading
var pluginRegistrar = app.Services.GetService<IPluginRegistrar>();
if (pluginRegistrar is PluginManager manager)
{
    manager.RegisterPlugin(new DefaultCustomAppPlugin());

    manager.LoadPluginsFromDirectory("Plugins"); // Assuming this method exists
    var routes = manager.GetRegisteredRoutes();
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
        foreach (var route in routes)
        {
            endpoints.MapGet(route.Key, route.Value);
        }

        // Fallback for SPA routing
        endpoints.MapFallbackToFile("index.html");
    });
}

app.Run();
