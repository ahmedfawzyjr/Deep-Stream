package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
)

var (
	ErrNotFound  = errors.New("match not found")
	ErrInvalidID = errors.New("invalid match id")
)

type Match struct {
	ID          string    `json:"id"`
	HomeTeam    string    `json:"home_team"`
	AwayTeam    string    `json:"away_team"`
	Competition string    `json:"competition"`
	MatchDate   time.Time `json:"match_date"`
	Status      string    `json:"status"`
	HomeScore   *int      `json:"home_score,omitempty"`
	AwayScore   *int      `json:"away_score,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Prediction struct {
	ID           string    `json:"id"`
	MatchID      string    `json:"match_id"`
	HomeWinProb  float64   `json:"home_win_prob"`
	DrawProb     float64   `json:"draw_prob"`
	AwayWinProb  float64   `json:"away_win_prob"`
	ModelVersion string    `json:"model_version"`
	LatencyMs    float64   `json:"latency_ms"`
	CreatedAt    time.Time `json:"created_at"`
}

type MatchRepository interface {
	GetByID(ctx context.Context, id string) (*Match, error)
	List(ctx context.Context, limit, offset int) ([]*Match, error)
	Create(ctx context.Context, match *Match) error
	UpdateScore(ctx context.Context, id string, homeScore, awayScore int, status string) error
	CreatePrediction(ctx context.Context, pred *Prediction) error
	GetLatestPrediction(ctx context.Context, matchID string) (*Prediction, error)
}

type pgMatchRepository struct {
	conn *pgx.Conn
}

func NewMatchRepository(conn *pgx.Conn) MatchRepository {
	return &pgMatchRepository{conn: conn}
}

func (r *pgMatchRepository) GetByID(ctx context.Context, id string) (*Match, error) {
	if id == "" {
		return nil, ErrInvalidID
	}

	query := `SELECT id, home_team, away_team, competition, match_date, status, home_score, away_score, created_at, updated_at 
	          FROM matches WHERE id = $1`

	var m Match
	err := r.conn.QueryRow(ctx, query, id).Scan(
		&m.ID, &m.HomeTeam, &m.AwayTeam, &m.Competition, &m.MatchDate, &m.Status, &m.HomeScore, &m.AwayScore, &m.CreatedAt, &m.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get match: %w", err)
	}

	return &m, nil
}

func (r *pgMatchRepository) List(ctx context.Context, limit, offset int) ([]*Match, error) {
	query := `SELECT id, home_team, away_team, competition, match_date, status, home_score, away_score, created_at, updated_at 
	          FROM matches 
	          ORDER BY match_date DESC 
	          LIMIT $1 OFFSET $2`

	rows, err := r.conn.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list matches: %w", err)
	}
	defer rows.Close()

	var matches []*Match
	for rows.Next() {
		var m Match
		err := rows.Scan(
			&m.ID, &m.HomeTeam, &m.AwayTeam, &m.Competition, &m.MatchDate, &m.Status, &m.HomeScore, &m.AwayScore, &m.CreatedAt, &m.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan match row: %w", err)
		}
		matches = append(matches, &m)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return matches, nil
}

func (r *pgMatchRepository) Create(ctx context.Context, m *Match) error {
	query := `INSERT INTO matches (home_team, away_team, competition, match_date, status, home_score, away_score) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7) 
	          RETURNING id, created_at, updated_at`

	err := r.conn.QueryRow(ctx, query, m.HomeTeam, m.AwayTeam, m.Competition, m.MatchDate, m.Status, m.HomeScore, m.AwayScore).Scan(
		&m.ID, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create match: %w", err)
	}

	return nil
}

func (r *pgMatchRepository) UpdateScore(ctx context.Context, id string, homeScore, awayScore int, status string) error {
	if id == "" {
		return ErrInvalidID
	}

	query := `UPDATE matches 
	          SET home_score = $1, away_score = $2, status = $3, updated_at = NOW() 
	          WHERE id = $4`

	cmdTag, err := r.conn.Exec(ctx, query, homeScore, awayScore, status, id)
	if err != nil {
		return fmt.Errorf("failed to update match score: %w", err)
	}

	if cmdTag.RowsAffected() == 0 {
		return ErrNotFound
	}

	return nil
}

func (r *pgMatchRepository) CreatePrediction(ctx context.Context, pred *Prediction) error {
	query := `INSERT INTO predictions (match_id, home_win_prob, draw_prob, away_win_prob, model_version, latency_ms) 
	          VALUES ($1, $2, $3, $4, $5, $6) 
	          RETURNING id, created_at`

	err := r.conn.QueryRow(ctx, query, pred.MatchID, pred.HomeWinProb, pred.DrawProb, pred.AwayWinProb, pred.ModelVersion, pred.LatencyMs).Scan(
		&pred.ID, &pred.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create prediction: %w", err)
	}

	return nil
}

func (r *pgMatchRepository) GetLatestPrediction(ctx context.Context, matchID string) (*Prediction, error) {
	query := `SELECT id, match_id, home_win_prob, draw_prob, away_win_prob, model_version, latency_ms, created_at 
	          FROM predictions 
	          WHERE match_id = $1 
	          ORDER BY created_at DESC 
	          LIMIT 1`

	var p Prediction
	err := r.conn.QueryRow(ctx, query, matchID).Scan(
		&p.ID, &p.MatchID, &p.HomeWinProb, &p.DrawProb, &p.AwayWinProb, &p.ModelVersion, &p.LatencyMs, &p.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get latest prediction: %w", err)
	}

	return &p, nil
}
