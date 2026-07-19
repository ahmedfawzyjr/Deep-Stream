package main

import (
	"context"
	"encoding/csv"
	"io"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/ahmedfawzyjr/deep-stream/api/internal/config"
)

func main() {
	log.Println("Starting database seeding from results.csv...")
	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	conn, err := pgx.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close(context.Background())

	// Open the results.csv file
	// Try a few possible paths depending on where the binary is run
	csvPaths := []string{
		"../dataset/results.csv",
		"dataset/results.csv",
		"../../dataset/results.csv",
		"../../../dataset/results.csv",
	}

	var file *os.File
	for _, path := range csvPaths {
		file, err = os.Open(path)
		if err == nil {
			break
		}
	}
	if err != nil {
		log.Fatalf("Failed to open results.csv: %v\n", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)

	// Read headers
	headers, err := reader.Read()
	if err != nil {
		log.Fatalf("Failed to read headers: %v\n", err)
	}

	headerMap := make(map[string]int)
	for i, h := range headers {
		headerMap[h] = i
	}

	var rows [][]string
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatalf("Error reading CSV row: %v\n", err)
		}
		rows = append(rows, record)
	}

	log.Printf("Read %d total matches. Seeding the most recent 100 matches...\n", len(rows))

	startIdx := len(rows) - 100
	if startIdx < 0 {
		startIdx = 0
	}

	inserted := 0
	for i := startIdx; i < len(rows); i++ {
		row := rows[i]
		dateStr := row[headerMap["date"]]
		homeTeam := row[headerMap["home_team"]]
		awayTeam := row[headerMap["away_team"]]
		homeScoreStr := row[headerMap["home_score"]]
		awayScoreStr := row[headerMap["away_score"]]
		tournament := row[headerMap["tournament"]]

		matchDate, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			// fallback
			matchDate = time.Now()
		}

		homeScore, err1 := strconv.Atoi(homeScoreStr)
		awayScore, err2 := strconv.Atoi(awayScoreStr)

		var homeScorePtr, awayScorePtr *int
		if err1 == nil && err2 == nil {
			homeScorePtr = &homeScore
			awayScorePtr = &awayScore
		}

		query := `INSERT INTO matches (home_team, away_team, competition, match_date, status, home_score, away_score) 
		          VALUES ($1, $2, $3, $4, $5, $6, $7)`
		_, err = conn.Exec(ctx, query, homeTeam, awayTeam, tournament, matchDate, "completed", homeScorePtr, awayScorePtr)
		if err != nil {
			log.Printf("Warning: failed to seed match %s vs %s: %v\n", homeTeam, awayTeam, err)
		} else {
			inserted++
		}
	}

	log.Printf("Database seed completed. Inserted %d matches.\n", inserted)
}
