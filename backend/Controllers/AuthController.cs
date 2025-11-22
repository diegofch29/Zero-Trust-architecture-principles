using Microsoft.AspNetCore.Mvc;
using MessageBackend.Models;
using MessageBackend.Services;

namespace MessageBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { error = "Username and password are required" });
        }

        if (!_authService.ValidateCredentials(request.Username, request.Password))
        {
            return Unauthorized(new { error = "Invalid credentials" });
        }

        var token = _authService.GenerateJwtToken(request.Username);

        return Ok(new LoginResponse
        {
            Token = token,
            Username = request.Username
        });
    }
}
