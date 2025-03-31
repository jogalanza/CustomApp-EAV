using CustomApp.Model.DBContext;
using CustomApp.Services.DataContext;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CustomApp.Host.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EavController : ControllerBase
    {
        private readonly IEavService _eavService;

        public EavController(IEavService eavService) => _eavService = eavService;

        [HttpPost("tables")]
        public async Task<IActionResult> CreateTable([FromBody] CreateTableRequest request)
        {
            var tableId = await _eavService.CreateTableAsync(request.TableName, request.Fields, request.FieldMetadata);
            return Ok(new { TableId = tableId });
        }

        [HttpPost("tables/{tableId}/rows")]
        public async Task<IActionResult> AddRow(int tableId, [FromBody] Dictionary<string, object> values)
        {
            var rowId = await _eavService.AddRowAsync(tableId, values);
            return Ok(new { RowId = rowId });
        }

        [HttpPut("rows/{rowId}")]
        public async Task<IActionResult> UpdateRow(int rowId, [FromBody] Dictionary<string, object> values)
        {
            await _eavService.UpdateRowAsync(rowId, values);
            return Ok();
        }

        [HttpGet("tables/{tableId}/rows")]
        public async Task<IActionResult> GetRows(int tableId)
        {
            var rows = await _eavService.GetRowsAsync(tableId);
            return Ok(rows);
        }

        [HttpGet("tables/{tableId}/rows/dynamic")]
        public async Task<IActionResult> GetRowsDynamic(int tableId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10,
            [FromQuery] string where = null, [FromQuery] string orderBy = null, [FromQuery] bool includeLargeObjects = true)
        {
            var rows = await _eavService.GetRowsDynamicAsync(tableId, page, pageSize, where, orderBy, includeLargeObjects);
            return Ok(rows);
        }

        [HttpGet("tables/{tableId}/fields")]
        public async Task<IActionResult> GetTableFields(int tableId)
        {
            var fields = await _eavService.GetTableFieldsAsync(tableId);
            return Ok(fields);
        }

        [HttpDelete("rows/{rowId}")]
        public async Task<IActionResult> DeleteRow(int rowId)
        {
            await _eavService.DeleteRowAsync(rowId);
            return Ok();
        }

        [HttpDelete("tables/{tableId}")]
        public async Task<IActionResult> DeleteTable(int tableId)
        {
            await _eavService.DeleteTableAsync(tableId);
            return Ok();
        }
    }
}
