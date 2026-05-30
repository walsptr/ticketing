# UML Aplikasi Ticketing

Dokumen ini menyajikan UML utama berdasarkan implementasi yang ada saat ini.

## 1. Use Case Diagram

```mermaid
flowchart LR
    Admin((Admin))
    Consultant((Consultant))
    Coordinator((Project Coordinator))

    UC1([Login])
    UC2([Logout])
    UC3([Lihat Profil])
    UC4([Update Profil])
    UC5([Ganti Password])
    UC6([Lihat Perangkat Aktif])
    UC7([Lihat Daftar User])
    UC8([Ubah Role User])
    UC9([Ubah Team User])
    UC10([Aktifkan atau Nonaktifkan User])
    UC11([Kelola Ticketing])

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10

    Consultant --> UC1
    Consultant --> UC2
    Consultant --> UC3
    Consultant --> UC4
    Consultant --> UC5
    Consultant --> UC6
    Consultant --> UC11

    Coordinator --> UC1
    Coordinator --> UC2
    Coordinator --> UC3
    Coordinator --> UC4
    Coordinator --> UC5
    Coordinator --> UC6
    Coordinator --> UC11
```

Catatan:

- `Kelola Ticketing` masih diposisikan sebagai use case konseptual karena domain data sudah ada, tetapi endpoint operasionalnya belum terlihat pada implementasi API aktif.

## 2. Class Diagram

```mermaid
classDiagram
    class Role {
        +uuid id
        +string name
        +datetime createdAt
        +datetime updatedAt
    }

    class User {
        +uuid id
        +string name
        +string email
        +string password
        +string avatarUrl
        +boolean isActive
        +uuid roleId
        +datetime createdAt
        +datetime updatedAt
    }

    class Team {
        +uuid id
        +string name
        +datetime createdAt
        +datetime updatedAt
    }

    class UserToTeam {
        +uuid userId
        +uuid teamId
        +boolean isLeader
        +datetime createdAt
        +datetime updatedAt
    }

    class AuthUser {
        +uuid id
        +uuid userId
        +string deviceId
        +string refreshToken
        +string userAgent
        +string ip
        +datetime expiresAt
        +datetime revokedAt
        +datetime createdAt
        +datetime updatedAt
    }

    class Project {
        +uuid id
        +string name
        +string slug
        +text description
        +datetime createdAt
        +datetime updatedAt
    }

    class TicketPhase {
        +uuid id
        +uuid projectId
        +string name
        +int order
        +datetime createdAt
        +datetime updatedAt
    }

    class Ticket {
        +uuid id
        +uuid projectId
        +uuid phaseId
        +uuid createdBy
        +string title
        +text description
        +string referenceCode
        +datetime startDate
        +datetime dueDate
        +int order
        +boolean isTask
        +uuid parentId
        +datetime createdAt
        +datetime updatedAt
    }

    class TicketLabel {
        +uuid id
        +string name
        +string color
        +datetime createdAt
        +datetime updatedAt
    }

    class LabeledTicket {
        +uuid ticketId
        +uuid labelId
    }

    class AssignedToTicket {
        +uuid ticketId
        +uuid userId
        +datetime createdAt
        +datetime updatedAt
    }

    class TicketReply {
        +uuid id
        +uuid ticketId
        +uuid createdBy
        +text content
        +int duration
        +datetime createdAt
        +datetime updatedAt
    }

    Role "1" --> "many" User : memiliki
    User "1" --> "many" AuthUser : memiliki_sesi
    User "1" --> "many" UserToTeam : tergabung
    Team "1" --> "many" UserToTeam : memiliki_anggota
    Project "1" --> "many" TicketPhase : memiliki
    Project "1" --> "many" Ticket : memiliki
    TicketPhase "1" --> "many" Ticket : memuat
    User "1" --> "many" Ticket : membuat
    Ticket "1" --> "many" Ticket : parent_of
    Ticket "1" --> "many" AssignedToTicket : ditugaskan_ke
    User "1" --> "many" AssignedToTicket : menerima_tugas
    Ticket "1" --> "many" LabeledTicket : memiliki_label
    TicketLabel "1" --> "many" LabeledTicket : digunakan_oleh
    Ticket "1" --> "many" TicketReply : memiliki_reply
    User "1" --> "many" TicketReply : menulis
```

## 3. Sequence Diagram Login

```mermaid
sequenceDiagram
    actor U as User
    participant UI as Login Page
    participant API as Login API
    participant DB as Database
    participant CK as Cookie Store

    U->>UI: Input email dan password
    UI->>API: POST /api/auth/login
    API->>DB: Cari user berdasarkan email
    DB-->>API: Data user
    API->>API: Verifikasi password
    API->>CK: Ambil deviceId
    API->>DB: Cek sesi device sebelumnya
    DB-->>API: Status sesi
    API->>API: Generate accessToken dan refreshToken
    API->>DB: Simpan auth_users
    API-->>UI: Kirim data user dan auth
    UI->>CK: Simpan cookie token dan deviceId
```

## 4. Sequence Diagram Admin Mengubah Role User

```mermaid
sequenceDiagram
    actor A as Admin
    participant UI as Manage User Page
    participant MW as Auth Middleware
    participant API as Update Role API
    participant DB as Database

    A->>UI: Pilih user dan role baru
    UI->>MW: PUT /api/users/{id}/role
    MW->>MW: Validasi token dan role admin
    MW-->>API: Request valid
    API->>DB: Validasi user target
    API->>DB: Validasi role target
    API->>DB: Hapus relasi team jika role bukan consultant
    API->>DB: Update role user
    DB-->>API: Data user terbaru
    API-->>UI: Response sukses
```

## 5. Activity Diagram Konseptual Ticket Lifecycle

```mermaid
flowchart TD
    A[Mulai] --> B[Buat project]
    B --> C[Siapkan phase ticket]
    C --> D[Buat ticket]
    D --> E[Assign user]
    E --> F[Tambahkan label]
    F --> G[Kerjakan ticket]
    G --> H[Tambahkan reply atau progress]
    H --> I{Perlu lanjut?}
    I -- Ya --> J[Pindahkan phase]
    J --> G
    I -- Tidak --> K[Selesai]
```
