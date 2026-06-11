import torch
import torch.nn as nn
import math

class PositionalEncoding(nn.Module):
    def __init__(self, d_model: int, dropout: float = 0.1, max_len: int = 5000):
        super().__init__()
        self.dropout = nn.Dropout(p=dropout)

        position = torch.arange(max_len).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2) * (-math.log(10000.0) / d_model))
        pe = torch.zeros(max_len, 1, d_model)
        pe[:, 0, 0::2] = torch.sin(position * div_term)
        pe[:, 0, 1::2] = torch.cos(position * div_term)
        self.register_buffer('pe', pe)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [batch_size, seq_len, embedding_dim]
        # Positional encoding expects [seq_len, batch_size, embedding_dim]
        x = x.transpose(0, 1)
        x = x + self.pe[:x.size(0)]
        x = x.transpose(0, 1)
        return self.dropout(x)


class TransformerTacticsAnalyzer(nn.Module):
    """
    Transformer for tactical pattern recognition.
    Input: Player positions + ball location (spatio-temporal)
    Output: Tactical classification + prediction
    """
    
    def __init__(
        self,
        d_model: int = 256,
        nhead: int = 8,
        num_layers: int = 6,
        dim_feedforward: int = 1024,
        dropout: float = 0.1
    ):
        super().__init__()
        
        # Embed player positions (x, y, velocity_x, velocity_y)
        self.player_embedding = nn.Linear(4, d_model)
        
        # Positional encoding for time steps
        self.pos_encoder = PositionalEncoding(d_model, dropout)
        
        # Transformer encoder
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=dim_feedforward,
            dropout=dropout,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(
            encoder_layer,
            num_layers=num_layers
        )
        
        # Classification heads
        self.formation_classifier = nn.Linear(d_model, 10)  # 4-4-2, 4-3-3, etc.
        self.outcome_predictor = nn.Linear(d_model, 3)
        self.pressure_index = nn.Linear(d_model, 1)
        
    def forward(self, player_positions: torch.Tensor) -> dict:
        # player_positions: (batch, time, players, 4)
        batch, time, players, _ = player_positions.shape
        
        # Flatten players into sequence
        x = player_positions.view(batch * time, players, 4)
        x = self.player_embedding(x)  # (batch*time, players, d_model)
        
        # Average over players -> (batch*time, d_model)
        x = x.mean(dim=1)
        x = x.view(batch, time, -1)
        
        # Add positional encoding
        x = self.pos_encoder(x)
        
        # Transformer
        encoded = self.transformer(x)  # (batch, time, d_model)
        
        # Use last time step
        last = encoded[:, -1, :]
        
        return {
            'formation': self.formation_classifier(last),
            'outcome': self.outcome_predictor(last),
            'pressure': self.pressure_index(last)
        }
