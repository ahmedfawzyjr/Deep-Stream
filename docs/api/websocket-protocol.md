# DeepKick WebSocket Protocol

WebSocket endpoint: `ws://localhost:8080/v1/match/{id}/live`

## Messages Received from Server
The server streams live updates as JSON payloads containing the following keys:
- `match_id`: String
- `win_probability`: Float (0 to 1)
- `draw_probability`: Float (0 to 1)
- `loss_probability`: Float (0 to 1)
- `minute`: Integer (1 to 90)
- `xg`: Object (team_a: float, team_b: float)
- `momentum`: Float (-100 to 100)
