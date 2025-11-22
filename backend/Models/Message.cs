namespace MessageBackend.Models;

public class Message
{
    public string MessageText { get; set; } = string.Empty;
    public string ClientIp { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class MessageRequest
{
    public string Message { get; set; } = string.Empty;
}
