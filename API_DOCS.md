openapi: 3.0.0
info:
  title: Workforce Intelligence Portal API
  description: REST API for workforce management, resource allocation, and performance tracking
  version: 1.0.0
  contact:
    name: Support
    url: https://github.com

servers:
  - url: http://localhost:5000/api
    description: Local development
  - url: https://api.workforce-intelligence.app/api
    description: Production

paths:
  /auth/login:
    post:
      summary: User login
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
              required:
                - email
                - password
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
                  token:
                    type: string

  /employees:
    get:
      summary: List all employees
      tags:
        - Employees
      security:
        - bearerAuth: []
      parameters:
        - name: department
          in: query
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of employees
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Employee'
        '401':
          description: Unauthorized

  /employees/{id}:
    get:
      summary: Get employee details
      tags:
        - Employees
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Employee details with skills and projects
        '404':
          description: Employee not found

  /projects:
    get:
      summary: List all projects
      tags:
        - Projects
      security:
        - bearerAuth: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [planning, active, on_hold, completed]
      responses:
        '200':
          description: List of projects
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Project'

  /dashboard/overview:
    get:
      summary: Get dashboard overview KPIs
      tags:
        - Dashboard
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Dashboard metrics
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DashboardOverview'

  /dashboard/team-performance:
    get:
      summary: Get team performance metrics
      tags:
        - Dashboard
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Performance by department

  /intelligence/team-analysis:
    post:
      summary: Analyze team performance with Claude
      tags:
        - Intelligence
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                department:
                  type: string
      responses:
        '200':
          description: Team analysis with Claude insights

  /intelligence/skill-gaps:
    post:
      summary: Identify skill gaps
      tags:
        - Intelligence
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                employee_id:
                  type: integer
                project_id:
                  type: integer
              required:
                - employee_id
                - project_id
      responses:
        '200':
          description: Skill gap analysis

  /intelligence/flight-risk:
    post:
      summary: Assess employee flight risk
      tags:
        - Intelligence
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                employee_id:
                  type: integer
              required:
                - employee_id
      responses:
        '200':
          description: Flight risk assessment

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        email:
          type: string
          format: email
        name:
          type: string
        role:
          type: string
          enum: [employee, manager, hr_admin, executive]
        department:
          type: string

    Employee:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
        job_title:
          type: string
        performance_rating:
          type: number
          format: float
        utilization_rate:
          type: number
          format: float
        risk_flag:
          type: string
          enum: [low, medium, high]
        skills:
          type: array
          items:
            type: object
            properties:
              skill_name:
                type: string
              proficiency_level:
                type: string

    Project:
      type: object
      properties:
        id:
          type: integer
        project_name:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [planning, active, on_hold, completed]
        start_date:
          type: string
          format: date
        end_date:
          type: string
          format: date
        required_headcount:
          type: integer

    DashboardOverview:
      type: object
      properties:
        totalEmployees:
          type: integer
        avgUtilization:
          type: number
          format: float
        highRiskCount:
          type: integer
        activeProjects:
          type: integer
        openPositions:
          type: integer

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
