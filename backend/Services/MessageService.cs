using MessageBackend.Models;
using System.Collections.Concurrent;

namespace MessageBackend.Services;

public interface IMessageService
{
    void AddMessage(string message, string clientIp);
    List<Message> GetLastMessages(int count = 10);
}

public class MessageService : IMessageService
{
    private readonly ConcurrentDictionary<Guid, Message> _messages = new();
    private readonly List<Guid> _messageOrder = new();
    private readonly object _lock = new();

    public void AddMessage(string message, string clientIp)
    {
        var messageObj = new Message
        {
            MessageText = message,
            ClientIp = clientIp,
            Timestamp = DateTime.UtcNow
        };

        var id = Guid.NewGuid();

        lock (_lock)
        {
            _messages[id] = messageObj;
            _messageOrder.Add(id);
        }
    }

    public List<Message> GetLastMessages(int count = 10)
    {
        lock (_lock)
        {
            return _messageOrder
                .TakeLast(count)
                .Reverse()
                .Select(id => _messages[id])
                .ToList();
        }
    }
}
