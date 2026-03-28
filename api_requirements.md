# API Requirements for Project Dashboard & Management

This document outlines the required APIs needed from the Backend team to fully support the Frontend features requested by the Lecturer.

## 1. Project Summary Statistics
**Description:** Retrieves aggregated statistics for a project so the frontend doesn't need to fetch stats for each student individually.
**Endpoint:** `GET /github/stats/project/{projectId}/summary`
**Role:** Lecturer
**Response Format:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "projectId": "uuid",
    "totalCommits": 125,
    "totalLinesAdded": 5000,
    "totalLinesDeleted": 1200,
    "averageCommitsPerStudent": 25.0,
    "memberCount": 5
  }
}
```

## 2. Smart Alerts & Inactivity Criteria
**Description:** Instead of the frontend guessing who needs attention solely based on commit count, the backend should return enriched alert flags for each student in the project stats.
**Endpoint:** `GET /github/stats/project/{projectId}/students/alerts` (Or append to existing project stats/members API)
**Role:** Lecturer
**Response Format (per student):**
```json
{
  "studentId": "uuid",
  "commits": 12,
  "lastCommitDate": "2023-10-25T14:30:00Z",
  "isInactive": true, // e.g. no commits in last 5 days
  "contributionRatio": 0.05, // e.g. contributed 5% of total
  "warningLevel": "HIGH" // "NONE", "LOW", "HIGH"
}
```

## 3. Project Class Ranking
**Description:** Retrieves the rank of the current project compared to other projects in the same class based on commits or lines of code.
**Endpoint:** `GET /github/stats/project/{projectId}/ranking`
**Role:** Lecturer
**Response Format:**
```json
{
  "statusCode": 200,
  "message": "success",
  "data": {
    "projectId": "uuid",
    "classRank": 2,
    "totalProjectsInClass": 10,
    "percentile": 80.5,
    "evaluation": "ABOVE_AVERAGE"
  }
}
```

## 4. Notification & Warning APIs
**Description:** APIs to send actual email or in-app notifications to students requiring attention.
**Endpoint 1:** `POST /notifications/send` (General system broadcast)
**Endpoint 2:** `POST /projects/{projectId}/students/{studentId}/warn` (Targeted project warning)
**Role:** Lecturer
**Payload for Endpoint 2:**
```json
{
  "message": "You have been inactive for 5 days. Please update your progress on GitHub.",
  "warningType": "INACTIVITY"
}
```
