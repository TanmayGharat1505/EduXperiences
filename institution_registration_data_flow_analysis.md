# Institution Registration Data Flow Analysis

## Current Data Flow for Tutor and Student

### **Tutor Registration Flow:**
1. **Auth User Creation** → `auth.users` table
2. **Basic Profile** → `profiles` table (role: 'tutor')
3. **Tutor Profile** → `tutor_profiles` table (detailed tutor data)
4. **Dashboard Data** → Fetches from `tutor_profiles` table

### **Student Registration Flow:**
1. **Auth User Creation** → `auth.users` table
2. **Basic Profile** → `profiles` table (role: 'student')
3. **Student Profile** → `student_profiles` table (detailed student data)
4. **Dashboard Data** → Fetches from `student_profiles` table

## Current Institution Registration Flow (PROBLEMATIC)

### **Institution Registration Flow:**
1. **Auth User Creation** → `auth.users` table
2. **Basic Profile** → `profiles` table (role: 'institution')
3. **Institution Registration** → `institutions` table (7-page form data)
4. **Dashboard Data** → Tries to fetch from `institution_profiles` table (WRONG!)

## The Problem

The institution registration saves data to the `institutions` table, but the dashboard tries to fetch from `institution_profiles` table. This is why your data is not showing up!

## Solution: Fix Institution Registration Flow

### **Correct Institution Registration Flow Should Be:**
1. **Auth User Creation** → `auth.users` table
2. **Basic Profile** → `profiles` table (role: 'institution')
3. **Institution Profile** → `institution_profiles` table (7-page form data)
4. **Dashboard Data** → Fetches from `institution_profiles` table

## Tables Used for Each Role

| Role | Auth Table | Basic Profile | Detailed Profile | Dashboard Source |
|------|------------|---------------|------------------|------------------|
| **Tutor** | `auth.users` | `profiles` | `tutor_profiles` | `tutor_profiles` |
| **Student** | `auth.users` | `profiles` | `student_profiles` | `student_profiles` |
| **Institution** | `auth.users` | `profiles` | `institution_profiles` | `institution_profiles` |

## Current Issue

- **Institution registration** saves to `institutions` table
- **Institution dashboard** tries to fetch from `institution_profiles` table
- **Result**: Data mismatch, empty dashboard

## Fix Required

1. **Update institution registration** to save to `institution_profiles` table
2. **Update institution dashboard** to fetch from `institution_profiles` table
3. **Ensure data consistency** between registration and dashboard
