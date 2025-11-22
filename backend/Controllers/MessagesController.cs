using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MessageBackend.Models;
using MessageBackend.Services;

namespace MessageBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // Require JWT authentication for all endpoints
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessagesController(IMessageService messageService)
    {
        _messageService = messageService;
    }

    [HttpPost]
    public IActionResult PostMessage([FromBody] MessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { error = "Message cannot be empty" });
        }

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        _messageService.AddMessage(request.Message, clientIp);

        return Ok(new { success = true, message = "Message received" });
    }

    [HttpGet]
    public IActionResult GetMessages()
    {
        var messages = _messageService.GetLastMessages(10);
        return Ok(messages);
    }
}
