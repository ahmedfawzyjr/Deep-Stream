package repository_test

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/assert"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"

	"github.com/ahmedfawzyjr/deep-stream/api/internal/repository"
)

func TestMatchRepository_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()

	dbName := "deepstream_test"
	dbUser := "postgres"
	dbPassword := "postgres"

	postgresContainer, err := postgres.RunContainer(ctx,
		testcontainers.WithImage("postgres:16-alpine"),
		postgres.WithDatabase(dbName),
		postgres.WithUsername(dbUser),
		postgres.WithPassword(dbPassword),
		testcontainers.WithWaitSpec(wait.ForLog("database system is ready to accept connections").WithOccurrence(2).WithStartupTimeout(60*time.Second)),
	)
	if err != nil {
		t.Fatalf("failed to start postgres container: %v", err)
	}
	defer func() {
		if err := postgresContainer.Terminate(ctx); err != nil {
			t.Fatalf("failed to terminate container: %v", err)
		}
	}()

	connStr, err := postgresContainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		t.Fatalf("failed to get connection string: %v", err)
	}

	conn, err := pgx.Connect(ctx, connStr)
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}
	defer conn.Close(ctx)

	migrations := []string{
		"../../migrations/001_create_matches.sql",
		"../../migrations/002_create_predictions.sql",
		"../../migrations/003_create_users.sql",
	}

	for _, path := range migrations {
		content, err := os.ReadFile(path)
		if err != nil {
			t.Fatalf("failed to read migration file %s: %v", path, err)
		}
		_, err = conn.Exec(ctx, string(content))
		if err != nil {
			t.Fatalf("failed to run migration %s: %v", path, err)
		}
	}

	repo := repository.NewMatchRepository(conn)

	scoreHome := 2
	scoreAway := 1
	match := &repository.Match{
		HomeTeam:    "Arsenal",
		AwayTeam:    "Chelsea",
		Competition: "Premier League",
		MatchDate:   time.Now().Truncate(time.Microsecond),
		Status:      "played",
		HomeScore:   &scoreHome,
		AwayScore:   &scoreAway,
	}

	err = repo.Create(ctx, match)
	assert.NoError(t, err)
	assert.NotEmpty(t, match.ID)

	fetched, err := repo.GetByID(ctx, match.ID)
	assert.NoError(t, err)
	assert.Equal(t, "Arsenal", fetched.HomeTeam)
	assert.Equal(t, "Chelsea", fetched.AwayTeam)
	assert.Equal(t, "played", fetched.Status)
	assert.Equal(t, 2, *fetched.HomeScore)

	list, err := repo.List(ctx, 10, 0)
	assert.NoError(t, err)
	assert.Len(t, list, 1)

	err = repo.UpdateScore(ctx, match.ID, 3, 3, "draw")
	assert.NoError(t, err)

	fetched2, err := repo.GetByID(ctx, match.ID)
	assert.NoError(t, err)
	assert.Equal(t, 3, *fetched2.HomeScore)
	assert.Equal(t, 3, *fetched2.AwayScore)
	assert.Equal(t, "draw", fetched2.Status)

	pred := &repository.Prediction{
		MatchID:      match.ID,
		HomeWinProb:  0.4,
		DrawProb:     0.3,
		AwayWinProb:  0.3,
		ModelVersion: "v1",
		LatencyMs:    4.2,
	}

	err = repo.CreatePrediction(ctx, pred)
	assert.NoError(t, err)
	assert.NotEmpty(t, pred.ID)

	latestPred, err := repo.GetLatestPrediction(ctx, match.ID)
	assert.NoError(t, err)
	assert.Equal(t, 0.4, latestPred.HomeWinProb)
}
