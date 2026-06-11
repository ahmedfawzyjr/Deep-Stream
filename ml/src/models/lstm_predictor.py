import torch
import torch.nn as nn

class LSTMMomentumPredictor(nn.Module):
    """
    LSTM for in-game momentum prediction.
    Input: Sequence of match events (goals, shots, possession)
    Output: Win probability at each minute
    """
    
    def __init__(
        self,
        input_size: int = 50,      # Features per time step
        hidden_size: int = 128,
        num_layers: int = 2,
        dropout: float = 0.3,
        output_size: int = 3      # win, draw, loss
    ):
        super().__init__()
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
            bidirectional=True
        )
        
        self.attention = nn.MultiheadAttention(
            embed_dim=hidden_size * 2,  # bidirectional
            num_heads=8,
            dropout=dropout,
            batch_first=True
        )
        
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size * 2, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, output_size),
            nn.Softmax(dim=-1)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch, seq_len, features)
        lstm_out, _ = self.lstm(x)  # (batch, seq_len, hidden*2)
        
        # Self-attention over time steps
        attn_out, _ = self.attention(lstm_out, lstm_out, lstm_out)
        
        # Use last time step for prediction
        last_hidden = attn_out[:, -1, :]  # (batch, hidden*2)
        
        return self.classifier(last_hidden)
