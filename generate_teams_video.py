import os
import sys
import math
import wave
import struct
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

# Canvas dimensions
WIDTH = 1920
HEIGHT = 1080
FPS = 30

# Colors (Seed Design System)
BG_COLOR = (248, 249, 246)         # #f8f9f6
CARD_BG = (255, 255, 255)
FOREST = (28, 58, 19)              # #1c3a13
LIME = (211, 250, 153)             # #d3fa99
LIME_DARK = (90, 130, 40)
SLATE_DARK = (15, 23, 42)          # #0f172a
SLATE_MUTED = (100, 116, 139)      # #64748b
BORDER = (226, 232, 240)           # #e2e8f0
ACCENT_BLUE = (37, 99, 235)
ACCENT_GREEN = (22, 163, 74)
ACCENT_RED = (220, 38, 38)
ACCENT_AMBER = (217, 119, 6)

# Fonts
font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 36)
font_subtitle = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 22)
font_heading = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 26)
font_body = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 20)
font_body_b = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 20)
font_small = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 16)
font_small_b = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 16)
font_badge = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 18)
font_logo = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 40)

SCENES = [
    {
        "role": "PACIENTE",
        "role_badge": (40, 120, 60),
        "scene_num": "01 / 11",
        "title": "Gatekeeper de Acceso - Perfil Paciente",
        "subtitle": "Acceso seguro, selección de rol y autenticación con protección de intentos",
        "url": "https://mediturno.salud.gov/login?role=paciente",
        "mockup_type": "login_paciente",
        "what_it_does": "Aísla el acceso exclusivo al portal del paciente mediante autenticación robusta y control de sesiones.",
        "key_actions": "• Selección de perfil 'Paciente' • Ingreso seguro de Documento/Correo y Contraseña • Botón 'Iniciar Sesión'.",
        "relation": "Garantiza que el paciente acceda exclusivamente a su historial clínico sin exponer datos médicos confidenciales de otros usuarios.",
        "click_pos": (960, 650),
        "duration_sec": 4.5
    },
    {
        "role": "PACIENTE",
        "role_badge": (40, 120, 60),
        "scene_num": "02 / 11",
        "title": "Portal de Citas y Turnos Activos",
        "subtitle": "Vista principal del paciente con resumen de citas programadas y acciones rápidas",
        "url": "https://mediturno.salud.gov/paciente/citas",
        "mockup_type": "paciente_citas",
        "what_it_does": "Muestra las citas vigentes, estado de confirmación, profesional asignado y consultorio.",
        "key_actions": "• Botón destacado 'Nueva Cita' • Opciones de 'Reprogramar' o 'Cancelar' • Filtro por estado.",
        "relation": "Refleja en tiempo real las citas reservadas en el sistema y permite liberar turnos para la agenda del doctor.",
        "click_pos": (1220, 310),
        "duration_sec": 4.5
    },
    {
        "role": "PACIENTE",
        "role_badge": (40, 120, 60),
        "scene_num": "03 / 11",
        "title": "Reserva de Turno Atómica en 4 Pasos",
        "subtitle": "Flujo guiado: Especialidad → Médico Especialista → Calendario → Horario Disponible",
        "url": "https://mediturno.salud.gov/paciente/reservar",
        "mockup_type": "reserva_pasos",
        "what_it_does": "Permite agendar una consulta médica de forma intuitiva y sin solapamiento de turnos.",
        "key_actions": "• Selector de Especialidad • Selección de Médico • Calendario interactivo • Bloques horarios.",
        "relation": "Bloquea instantáneamente la franja horaria en la agenda del doctor y la base de datos de administración.",
        "click_pos": (1030, 660),
        "duration_sec": 5.0
    },
    {
        "role": "PACIENTE",
        "role_badge": (40, 120, 60),
        "scene_num": "04 / 11",
        "title": "Voucher Digital y Confirmación WhatsApp",
        "subtitle": "Comprobante oficial con código QR y notificación instantánea multicanal",
        "url": "https://mediturno.salud.gov/paciente/voucher/MED-9402",
        "mockup_type": "voucher",
        "what_it_does": "Emite el voucher de confirmación con detalles completos de la consulta y código de validación.",
        "key_actions": "• Botón 'Enviar a WhatsApp' • 'Descargar PDF Oficial' • 'Ver en Mis Citas'.",
        "relation": "Envía recordatorio automático y actualiza el estado de la cita a 'Confirmada' en el panel del doctor.",
        "click_pos": (960, 680),
        "duration_sec": 4.5
    },
    {
        "role": "DOCTOR",
        "role_badge": (30, 80, 150),
        "scene_num": "05 / 11",
        "title": "Gatekeeper de Acceso - Perfil Doctor",
        "subtitle": "Ingreso profesional médico con validación de matrícula y credenciales cifradas",
        "url": "https://mediturno.salud.gov/login?role=doctor",
        "mockup_type": "login_doctor",
        "what_it_does": "Protege el entorno clínico asegurando que solo profesionales acreditados accedan a la agenda de pacientes.",
        "key_actions": "• Identificación por Matrícula/Correo • Contraseña de alta seguridad • Acceso directo a consulta.",
        "relation": "Verifica los permisos de facultativo y vincula la sesión únicamente a los pacientes asignados en su agenda.",
        "click_pos": (960, 650),
        "duration_sec": 4.0
    },
    {
        "role": "DOCTOR",
        "role_badge": (30, 80, 150),
        "scene_num": "06 / 11",
        "title": "Agenda Clínica Diaria de Consultas",
        "subtitle": "Gestión cronológica de turnos del día, estados de asistencia y sala de espera",
        "url": "https://mediturno.salud.gov/doctor/agenda",
        "mockup_type": "doctor_agenda",
        "what_it_does": "Organiza los pacientes citados hoy clasificados en: 'En Espera', 'Atendidos' y 'Pendientes'.",
        "key_actions": "• Botón 'Llamar Paciente' • 'Iniciar Atención' • Filtro por fecha de consulta • Ver motivo clínico.",
        "relation": "Consume las citas agendadas por los pacientes y notifica a recepción/administración el flujo de atención.",
        "click_pos": (1240, 500),
        "duration_sec": 5.0
    },
    {
        "role": "DOCTOR",
        "role_badge": (30, 80, 150),
        "scene_num": "07 / 11",
        "title": "Registro y Cierre de Atención Inmutable",
        "subtitle": "Historial clínico, notas de consulta y actualización de estado (Completada / No Asistió)",
        "url": "https://mediturno.salud.gov/doctor/atencion/MED-9402",
        "mockup_type": "doctor_atencion",
        "what_it_does": "Registra el diagnóstico, observaciones médicas y consolida el cierre definitivo de la cita.",
        "key_actions": "• Campo de Notas/Diagnóstico • Botón 'Completar Atención' • Botón 'Marcar Inasistencia'.",
        "relation": "Actualiza el historial del paciente de forma inmutable y alimenta las métricas de rendimiento en el panel de Administrador.",
        "click_pos": (1180, 670),
        "duration_sec": 5.0
    },
    {
        "role": "ADMINISTRADOR",
        "role_badge": (140, 40, 40),
        "scene_num": "08 / 11",
        "title": "Gatekeeper de Acceso - Perfil Administrador",
        "subtitle": "Autenticación administrativa con bloqueo por fuerza bruta y auditoría de sesiones",
        "url": "https://mediturno.salud.gov/login?role=admin",
        "mockup_type": "login_admin",
        "what_it_does": "Punto de entrada restringido para la gerencia operativa y supervisores del sistema hospitalario.",
        "key_actions": "• Credenciales de superusuario • Indicador de intentos restantes • Protección anti-fuerza bruta.",
        "relation": "Otorga control global sobre agendas, profesionales, reportes y configuración central del sistema.",
        "click_pos": (960, 650),
        "duration_sec": 4.0
    },
    {
        "role": "ADMINISTRADOR",
        "role_badge": (140, 40, 40),
        "scene_num": "09 / 11",
        "title": "Dashboard Central con Indicadores Operativos",
        "subtitle": "Métricas globales: Total de Citas, Tasa de Ocupación, Doctores Activos e Incidencias",
        "url": "https://mediturno.salud.gov/admin/dashboard",
        "mockup_type": "admin_dashboard",
        "what_it_does": "Proporciona visión ejecutiva en tiempo real sobre el flujo asistencial de todo el centro médico.",
        "key_actions": "• Filtros por periodo y servicio • Tarjetas de KPIs interactivos • Gráficos de cumplimiento.",
        "relation": "Monitorea la actividad global generada por los pacientes al reservar y por los doctores al atender.",
        "click_pos": (1180, 310),
        "duration_sec": 5.0
    },
    {
        "role": "ADMINISTRADOR",
        "role_badge": (140, 40, 40),
        "scene_num": "10 / 11",
        "title": "Directorio de Médicos y Configuración de Horarios",
        "subtitle": "Asignación de turnos semanales, consultorios y validación estricta de no-solapamiento",
        "url": "https://mediturno.salud.gov/admin/medicos",
        "mockup_type": "admin_medicos",
        "what_it_does": "Administra la plantilla médica, especialidades activas y franjas de disponibilidad semanal.",
        "key_actions": "• Botón 'Nuevo Médico' • 'Asignar Horario' • Selector de franjas y días • Toggle Activo/Inactivo.",
        "relation": "Define las franjas horarias exactas que luego los pacientes podrán seleccionar en el agendamiento atómico.",
        "click_pos": (1230, 310),
        "duration_sec": 5.0
    },
    {
        "role": "ADMINISTRADOR",
        "role_badge": (140, 40, 40),
        "scene_num": "11 / 11",
        "title": "Reportes Consolidados y Exportación Oficial CSV",
        "subtitle": "Auditoría integral de citas, tiempos de espera y exportación para interoperabilidad",
        "url": "https://mediturno.salud.gov/admin/reportes",
        "mockup_type": "admin_reportes",
        "what_it_does": "Genera reportes operativos detallados para auditoría médica, cumplimiento y facturación.",
        "key_actions": "• Filtro por Especialidad y Rango de Fechas • Botón 'Exportar CSV' • Botón 'Generar PDF'.",
        "relation": "Permite descargar el historial completo de atenciones generadas en el sistema para la dirección del hospital.",
        "click_pos": (1220, 320),
        "duration_sec": 5.0
    }
]

def draw_rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def render_scene_frame(scene, progress_in_scene, total_time, elapsed_time):
    # Base Image
    im = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(im)

    # 1. Top Header Bar (Seed Style)
    draw.rectangle([(0, 0), (WIDTH, 90)], fill=FOREST)
    
    # Logo
    draw.text((60, 24), "MediTurno", font=font_logo, fill=LIME)
    draw.text((290, 38), "|  Sistema Integral de Gestión de Citas Médicas", font=font_subtitle, fill=(200, 225, 180))

    # Profile Badge
    role_text = f"PERFIL: {scene['role']}"
    draw_rounded_rect(draw, [(1450, 22), (1700, 68)], 12, fill=scene["role_badge"], outline=LIME, width=2)
    draw.text((1475, 33), role_text, font=font_badge, fill=(255, 255, 255))

    # Scene Indicator
    draw.text((1730, 35), scene["scene_num"], font=font_body_b, fill=LIME)

    # 2. Main Title & Subtitle Banner
    draw.text((60, 115), scene["title"], font=font_title, fill=SLATE_DARK)
    draw.text((60, 165), scene["subtitle"], font=font_subtitle, fill=SLATE_MUTED)

    # 3. Main Browser Mockup Window
    # Window dimensions: 1300 x 530, left 60, top 210
    win_x1, win_y1, win_x2, win_y2 = 60, 210, 1360, 750
    draw_rounded_rect(draw, [(win_x1, win_y1), (win_x2, win_y2)], 16, fill=CARD_BG, outline=BORDER, width=2)

    # Browser Top Bar
    draw_rounded_rect(draw, [(win_x1, win_y1), (win_x2, win_y1 + 50)], 16, fill=(241, 245, 249))
    draw.rectangle([(win_x1, win_y1 + 35), (win_x2, win_y1 + 50)], fill=(241, 245, 249)) # flatten bottom corners
    draw.line([(win_x1, win_y1 + 50), (win_x2, win_y1 + 50)], fill=BORDER, width=1)

    # Traffic light buttons
    draw.ellipse([(win_x1 + 20, win_y1 + 18), (win_x1 + 34, win_y1 + 32)], fill=(239, 68, 68))
    draw.ellipse([(win_x1 + 42, win_y1 + 18), (win_x1 + 56, win_y1 + 32)], fill=(245, 158, 11))
    draw.ellipse([(win_x1 + 64, win_y1 + 18), (win_x1 + 78, win_y1 + 32)], fill=(34, 197, 94))

    # Address bar
    draw_rounded_rect(draw, [(win_x1 + 100, win_y1 + 12), (win_x2 - 30, win_y1 + 38)], 8, fill=(255, 255, 255), outline=BORDER, width=1)
    draw.text((win_x1 + 120, win_y1 + 15), "🔒 " + scene["url"], font=font_small, fill=SLATE_MUTED)

    # Render Screen Mockup Content based on mockup_type
    content_y = win_y1 + 70
    mock_type = scene["mockup_type"]

    if "login" in mock_type:
        # Centered Login Card
        card_w, card_h = 520, 390
        cx1 = win_x1 + (win_x2 - win_x1 - card_w) // 2
        cy1 = content_y + 10
        cx2, cy2 = cx1 + card_w, cy1 + card_h
        draw_rounded_rect(draw, [(cx1, cy1), (cx2, cy2)], 14, fill=(255, 255, 255), outline=BORDER, width=2)
        
        # Login Card Header
        draw.text((cx1 + 40, cy1 + 25), f"Acceso Seguro - {scene['role']}", font=font_heading, fill=FOREST)
        draw.text((cx1 + 40, cy1 + 62), "Ingrese sus credenciales registradas", font=font_small, fill=SLATE_MUTED)

        # Input 1: Usuario / Documento
        draw.text((cx1 + 40, cy1 + 105), "Documento de Identidad / Matrícula", font=font_small_b, fill=SLATE_DARK)
        draw_rounded_rect(draw, [(cx1 + 40, cy1 + 130), (cx2 - 40, cy1 + 175)], 8, fill=(248, 250, 252), outline=BORDER, width=1)
        val = "1028394819" if "paciente" in mock_type else ("MP-849204" if "doctor" in mock_type else "admin@mediturno.salud.gov")
        draw.text((cx1 + 55, cy1 + 142), val, font=font_body, fill=SLATE_DARK)

        # Input 2: Contraseña
        draw.text((cx1 + 40, cy1 + 195), "Contraseña", font=font_small_b, fill=SLATE_DARK)
        draw_rounded_rect(draw, [(cx1 + 40, cy1 + 220), (cx2 - 40, cy1 + 265)], 8, fill=(248, 250, 252), outline=BORDER, width=1)
        draw.text((cx1 + 55, cy1 + 235), "••••••••••••••••", font=font_body, fill=SLATE_DARK)

        # Submit Button
        btn_color = FOREST if "paciente" in mock_type else ((30, 80, 150) if "doctor" in mock_type else (140, 40, 40))
        draw_rounded_rect(draw, [(cx1 + 40, cy1 + 295), (cx2 - 40, cy1 + 350)], 10, fill=btn_color)
        draw.text((cx1 + 160, cy1 + 310), "Ingresar al Sistema →", font=font_body_b, fill=(255, 255, 255))

    elif mock_type == "paciente_citas":
        # Paciente: Mis Citas
        draw.text((win_x1 + 40, content_y + 10), "Mis Citas Médicas Agendadas", font=font_heading, fill=FOREST)
        draw.text((win_x1 + 40, content_y + 45), "Historial de citas activas y programadas para consulta", font=font_small, fill=SLATE_MUTED)

        # New Appointment Button
        draw_rounded_rect(draw, [(win_x2 - 250, content_y + 10), (win_x2 - 40, content_y + 55)], 8, fill=FOREST)
        draw.text((win_x2 - 225, content_y + 20), "+ Agendar Nueva Cita", font=font_small_b, fill=LIME)

        # Appointment Cards
        citas = [
            ("Dr. Roberto Silva (Cardiología)", "Lunes 24 Nov - 09:30 AM", "Consultorio 302", "Confirmada", ACCENT_GREEN),
            ("Dra. Camila Morales (Pediatría)", "Jueves 27 Nov - 02:15 PM", "Consultorio 108", "Pendiente", ACCENT_AMBER)
        ]
        for i, (doc, dt, con, st, col) in enumerate(citas):
            cy = content_y + 85 + (i * 125)
            draw_rounded_rect(draw, [(win_x1 + 40, cy), (win_x2 - 40, cy + 105)], 12, fill=(255, 255, 255), outline=BORDER, width=1)
            draw.text((win_x1 + 65, cy + 20), doc, font=font_body_b, fill=SLATE_DARK)
            draw.text((win_x1 + 65, cy + 55), f"📅 {dt}  |  📍 {con}", font=font_body, fill=SLATE_MUTED)
            
            # Badge
            draw_rounded_rect(draw, [(win_x2 - 380, cy + 32), (win_x2 - 260, cy + 68)], 8, fill=col)
            draw.text((win_x2 - 365, cy + 40), st, font=font_small_b, fill=(255, 255, 255))
            
            # Action button
            draw_rounded_rect(draw, [(win_x2 - 240, cy + 32), (win_x2 - 60, cy + 68)], 8, fill=(241, 245, 249), outline=BORDER, width=1)
            draw.text((win_x2 - 220, cy + 40), "Ver Voucher", font=font_small_b, fill=FOREST)

    elif mock_type == "reserva_pasos":
        # Steps Stepper Header
        steps = ["1. Especialidad ✓", "2. Médico ✓", "3. Fecha & Horario", "4. Confirmación"]
        step_w = 270
        for i, st in enumerate(steps):
            sx = win_x1 + 60 + (i * step_w)
            active = (i == 2)
            bg = FOREST if active else ((220, 240, 220) if i < 2 else (241, 245, 249))
            fg = (255, 255, 255) if active else (FOREST if i < 2 else SLATE_MUTED)
            draw_rounded_rect(draw, [(sx, content_y + 10), (sx + 240, content_y + 48)], 8, fill=bg)
            draw.text((sx + 35, content_y + 20), st, font=font_small_b, fill=fg)

        # 2 Column layout inside reservation
        # Col 1: Doctor Info
        draw_rounded_rect(draw, [(win_x1 + 60, content_y + 75), (win_x1 + 480, content_y + 430)], 12, fill=(248, 250, 252), outline=BORDER, width=1)
        draw.text((win_x1 + 85, content_y + 100), "Profesional Seleccionado", font=font_small_b, fill=SLATE_MUTED)
        draw.text((win_x1 + 85, content_y + 130), "Dr. Roberto Silva", font=font_heading, fill=FOREST)
        draw.text((win_x1 + 85, content_y + 165), "Cardiología Clínica", font=font_body, fill=SLATE_DARK)
        draw.text((win_x1 + 85, content_y + 200), "Sede Central - Cons. 302", font=font_small, fill=SLATE_MUTED)
        draw.text((win_x1 + 85, content_y + 230), "Tarifa Consulta: EPS / Subsidiada", font=font_small, fill=ACCENT_GREEN)

        # Col 2: Time slots
        draw.text((win_x1 + 520, content_y + 80), "Turnos Disponibles para el Lunes 24 de Noviembre", font=font_heading, fill=SLATE_DARK)
        slots = [
            ("08:00 AM", False), ("08:45 AM", False), ("09:30 AM", True), 
            ("10:15 AM", False), ("11:00 AM", False), ("02:00 PM", False),
            ("02:45 PM", False), ("03:30 PM", False), ("04:15 PM", False)
        ]
        for idx, (slot, selected) in enumerate(slots):
            row = idx // 3
            col = idx % 3
            bx = win_x1 + 520 + (col * 240)
            by = content_y + 130 + (row * 65)
            s_fill = FOREST if selected else ((255, 255, 255))
            s_fg = LIME if selected else SLATE_DARK
            s_border = FOREST if selected else BORDER
            draw_rounded_rect(draw, [(bx, by), (bx + 210, by + 50)], 8, fill=s_fill, outline=s_border, width=2 if selected else 1)
            draw.text((bx + 55, by + 14), slot, font=font_body_b, fill=s_fg)

        # Confirm step button
        draw_rounded_rect(draw, [(win_x1 + 850, content_y + 355), (win_x2 - 60, content_y + 415)], 10, fill=FOREST)
        draw.text((win_x1 + 920, content_y + 372), "Continuar a Confirmación →", font=font_body_b, fill=LIME)

    elif mock_type == "voucher":
        # Voucher confirmation card
        vw, vh = 680, 410
        vx1 = win_x1 + (win_x2 - win_x1 - vw) // 2
        vy1 = content_y + 10
        vx2, vy2 = vx1 + vw, vy1 + vh
        draw_rounded_rect(draw, [(vx1, vy1), (vx2, vy2)], 16, fill=(255, 255, 255), outline=ACCENT_GREEN, width=2)

        # Green header
        draw_rounded_rect(draw, [(vx1, vy1), (vx2, vy1 + 75)], 16, fill=(240, 253, 244))
        draw.text((vx1 + 40, vy1 + 22), "✓ Cita Confirmada Exitosamente", font=font_heading, fill=ACCENT_GREEN)
        draw.text((vx2 - 200, vy1 + 28), "Código: MED-9402", font=font_body_b, fill=FOREST)

        # Details
        draw.text((vx1 + 40, vy1 + 105), "Paciente: Carlos Alberto Gómez  |  CC 1028394819", font=font_body_b, fill=SLATE_DARK)
        draw.text((vx1 + 40, vy1 + 145), "Médico: Dr. Roberto Silva - Cardiología Clínica", font=font_body, fill=SLATE_DARK)
        draw.text((vx1 + 40, vy1 + 185), "Fecha y Hora: Lunes 24 de Noviembre - 09:30 AM", font=font_body_b, fill=FOREST)
        draw.text((vx1 + 40, vy1 + 225), "Ubicación: Sede Central - Consultorio 302 (Piso 3)", font=font_body, fill=SLATE_MUTED)

        # QR placeholder
        draw_rounded_rect(draw, [(vx2 - 160, vy1 + 100), (vx2 - 40, vy1 + 220)], 8, fill=(241, 245, 249), outline=BORDER, width=1)
        draw.text((vx2 - 130, vy1 + 145), "[ QR ]", font=font_heading, fill=SLATE_MUTED)

        # Buttons
        draw_rounded_rect(draw, [(vx1 + 40, vy1 + 285), (vx1 + 300, vy1 + 345)], 10, fill=(37, 211, 102)) # WhatsApp green
        draw.text((vx1 + 65, vy1 + 302), "📱 Compartir por WhatsApp", font=font_body_b, fill=(255, 255, 255))

        draw_rounded_rect(draw, [(vx1 + 330, vy1 + 285), (vx2 - 40, vy1 + 345)], 10, fill=FOREST)
        draw.text((vx1 + 375, vy1 + 302), "📥 Descargar Voucher PDF", font=font_body_b, fill=LIME)

    elif mock_type == "doctor_agenda":
        # Doctor Agenda
        draw.text((win_x1 + 40, content_y + 10), "Agenda de Consultas de Hoy - 24 Nov", font=font_heading, fill=FOREST)
        
        # Stats Cards
        stats = [("Total Pacientes", "12", FOREST), ("En Sala de Espera", "3", ACCENT_AMBER), ("Atendidos Hoy", "5", ACCENT_GREEN)]
        for i, (lbl, val, col) in enumerate(stats):
            bx = win_x1 + 40 + (i * 240)
            draw_rounded_rect(draw, [(bx, content_y + 50), (bx + 220, content_y + 115)], 8, fill=(248, 250, 252), outline=BORDER, width=1)
            draw.text((bx + 20, content_y + 58), lbl, font=font_small, fill=SLATE_MUTED)
            draw.text((bx + 20, content_y + 78), val, font=font_heading, fill=col)

        # Table Header
        ty = content_y + 135
        draw.rectangle([(win_x1 + 40, ty), (win_x2 - 40, ty + 38)], fill=(241, 245, 249))
        draw.text((win_x1 + 60, ty + 8), "Hora", font=font_small_b, fill=SLATE_DARK)
        draw.text((win_x1 + 180, ty + 8), "Paciente", font=font_small_b, fill=SLATE_DARK)
        draw.text((win_x1 + 480, ty + 8), "Motivo", font=font_small_b, fill=SLATE_DARK)
        draw.text((win_x1 + 780, ty + 8), "Estado", font=font_small_b, fill=SLATE_DARK)
        draw.text((win_x1 + 980, ty + 8), "Acción Clínica", font=font_small_b, fill=SLATE_DARK)

        # Rows
        rows = [
            ("09:30 AM", "Carlos Alberto Gómez (CC 1028394819)", "Control Hipertensión", "En Espera", ACCENT_AMBER, "Iniciar Consulta"),
            ("10:15 AM", "María Lucía Rincón (CC 52938471)", "Revisión Electrocardiograma", "Citado", SLATE_MUTED, "Llamar"),
            ("11:00 AM", "Jorge Enrique Mesa (CC 19483920)", "Chequeo Preventivo", "Citado", SLATE_MUTED, "Llamar")
        ]
        for i, (h, p, m, st, st_col, act) in enumerate(rows):
            ry = ty + 42 + (i * 68)
            draw_rounded_rect(draw, [(win_x1 + 40, ry), (win_x2 - 40, ry + 60)], 8, fill=(255, 255, 255), outline=BORDER, width=1)
            draw.text((win_x1 + 60, ry + 18), h, font=font_body_b, fill=FOREST)
            draw.text((win_x1 + 180, ry + 18), p, font=font_body, fill=SLATE_DARK)
            draw.text((win_x1 + 480, ry + 18), m, font=font_small, fill=SLATE_MUTED)
            
            # Badge
            draw_rounded_rect(draw, [(win_x1 + 780, ry + 12), (win_x1 + 910, ry + 46)], 6, fill=st_col)
            draw.text((win_x1 + 800, ry + 18), st, font=font_small_b, fill=(255, 255, 255))

            # Action button
            b_bg = FOREST if "Iniciar" in act else (241, 245, 249)
            b_fg = LIME if "Iniciar" in act else SLATE_DARK
            draw_rounded_rect(draw, [(win_x1 + 980, ry + 12), (win_x2 - 60, ry + 46)], 6, fill=b_bg)
            draw.text((win_x1 + 1010, ry + 18), act, font=font_small_b, fill=b_fg)

    elif mock_type == "doctor_atencion":
        # Clinical Consultation Form
        draw.text((win_x1 + 40, content_y + 10), "Consulta Médica Activa: Carlos Alberto Gómez", font=font_heading, fill=FOREST)
        draw.text((win_x1 + 40, content_y + 42), "Cita Ref #MED-9402  |  Cardiología Clínica", font=font_small, fill=SLATE_MUTED)

        # Form fields
        draw.text((win_x1 + 40, content_y + 80), "Diagnóstico Principal (CIE-10):", font=font_small_b, fill=SLATE_DARK)
        draw_rounded_rect(draw, [(win_x1 + 40, content_y + 105), (win_x2 - 40, content_y + 150)], 8, fill=(255, 255, 255), outline=BORDER, width=1)
        draw.text((win_x1 + 55, content_y + 118), "I10 - Hipertensión Esencial (Primaria)", font=font_body, fill=SLATE_DARK)

        draw.text((win_x1 + 40, content_y + 165), "Evolución Clínica y Observaciones:", font=font_small_b, fill=SLATE_DARK)
        draw_rounded_rect(draw, [(win_x1 + 40, content_y + 190), (win_x2 - 40, content_y + 310)], 8, fill=(255, 255, 255), outline=BORDER, width=1)
        draw.text((win_x1 + 55, content_y + 205), "Paciente refiere buena tolerancia a la medicación antihipertensiva. Presión arterial: 125/82 mmHg.", font=font_body, fill=SLATE_DARK)
        draw.text((win_x1 + 55, content_y + 235), "Se solicita control de laboratorio y se mantiene pauta farmacológica habitual. Próximo control en 6 meses.", font=font_body, fill=SLATE_DARK)

        # Action Buttons
        draw_rounded_rect(draw, [(win_x1 + 40, content_y + 340), (win_x1 + 300, content_y + 400)], 10, fill=ACCENT_RED)
        draw.text((win_x1 + 75, content_y + 358), "✕ Marcar No Asistió", font=font_body_b, fill=(255, 255, 255))

        draw_rounded_rect(draw, [(win_x2 - 380, content_y + 340), (win_x2 - 40, content_y + 400)], 10, fill=FOREST)
        draw.text((win_x2 - 340, content_y + 358), "✓ Cerrar Consulta y Guardar", font=font_body_b, fill=LIME)

    elif mock_type == "admin_dashboard":
        # Admin Dashboard
        draw.text((win_x1 + 40, content_y + 10), "Panel Ejecutivo y Métricas Operativas", font=font_heading, fill=FOREST)
        
        # 4 KPI cards
        kpis = [
            ("Citas Este Mes", "1,420", "+14% vs mes anterior", ACCENT_GREEN),
            ("Tasa de Asistencia", "94.2%", "Meta cumplida > 90%", FOREST),
            ("Médicos Activos", "28", "8 Especialidades", ACCENT_BLUE),
            ("Tiempo Promedio", "18 min", "Eficiencia óptima", ACCENT_AMBER)
        ]
        for i, (title, num, sub, col) in enumerate(kpis):
            bx = win_x1 + 40 + (i * 315)
            draw_rounded_rect(draw, [(bx, content_y + 55), (bx + 295, content_y + 175)], 12, fill=(255, 255, 255), outline=BORDER, width=1)
            draw.text((bx + 25, content_y + 70), title, font=font_small_b, fill=SLATE_MUTED)
            draw.text((bx + 25, content_y + 98), num, font=font_logo, fill=col)
            draw.text((bx + 25, content_y + 145), sub, font=font_small, fill=SLATE_DARK)

        # Chart mockup
        draw_rounded_rect(draw, [(win_x1 + 40, content_y + 200), (win_x2 - 40, content_y + 420)], 12, fill=(248, 250, 252), outline=BORDER, width=1)
        draw.text((win_x1 + 65, content_y + 215), "Demanda por Especialidad Médica (Últimas 4 Semanas)", font=font_heading, fill=SLATE_DARK)
        
        bars = [("Medicina General", 480, ACCENT_BLUE), ("Cardiología", 320, FOREST), ("Pediatría", 290, ACCENT_AMBER), ("Ginecología", 210, ACCENT_GREEN), ("Dermatología", 120, (140, 40, 120))]
        for i, (esp, val, bcol) in enumerate(bars):
            by = content_y + 260 + (i * 28)
            draw.text((win_x1 + 65, by), esp, font=font_small_b, fill=SLATE_DARK)
            # Bar line
            bar_w = int((val / 500) * 700)
            draw_rounded_rect(draw, [(win_x1 + 250, by + 2), (win_x1 + 250 + bar_w, by + 18)], 6, fill=bcol)
            draw.text((win_x1 + 265 + bar_w, by), f"{val} turnos", font=font_small, fill=SLATE_MUTED)

    elif mock_type == "admin_medicos":
        # Admin: Directory of Doctors & Schedule
        draw.text((win_x1 + 40, content_y + 10), "Directorio de Médicos y Horarios Semanales", font=font_heading, fill=FOREST)
        
        # New Doctor Button
        draw_rounded_rect(draw, [(win_x2 - 250, content_y + 10), (win_x2 - 40, content_y + 55)], 8, fill=FOREST)
        draw.text((win_x2 - 225, content_y + 20), "+ Asignar Horario", font=font_small_b, fill=LIME)

        # Doctor rows
        docs = [
            ("Dr. Roberto Silva", "Cardiología Clínica", "Lunes a Jueves | 08:00 - 14:00", "Consultorio 302", "Activo"),
            ("Dra. Camila Morales", "Pediatría Integral", "Lunes a Viernes | 13:00 - 18:00", "Consultorio 108", "Activo"),
            ("Dr. Fernando Castro", "Medicina General", "Martes y Jueves | 07:00 - 13:00", "Consultorio 204", "Activo")
        ]
        for i, (name, esp, hor, con, st) in enumerate(docs):
            ry = content_y + 75 + (i * 105)
            draw_rounded_rect(draw, [(win_x1 + 40, ry), (win_x2 - 40, ry + 90)], 10, fill=(255, 255, 255), outline=BORDER, width=1)
            draw.text((win_x1 + 65, ry + 18), name, font=font_body_b, fill=FOREST)
            draw.text((win_x1 + 65, ry + 50), f"Especialidad: {esp}  |  📍 {con}", font=font_small, fill=SLATE_MUTED)
            draw.text((win_x1 + 550, ry + 32), f"⏰ {hor}", font=font_body, fill=SLATE_DARK)

            # Active badge
            draw_rounded_rect(draw, [(win_x2 - 280, ry + 25), (win_x2 - 180, ry + 65)], 8, fill=ACCENT_GREEN)
            draw.text((win_x2 - 255, ry + 35), st, font=font_small_b, fill=(255, 255, 255))

            # Edit button
            draw_rounded_rect(draw, [(win_x2 - 160, ry + 25), (win_x2 - 60, ry + 65)], 8, fill=(241, 245, 249), outline=BORDER, width=1)
            draw.text((win_x2 - 135, ry + 35), "Editar", font=font_small_b, fill=SLATE_DARK)

    elif mock_type == "admin_reportes":
        # Admin: Reports & CSV Export
        draw.text((win_x1 + 40, content_y + 10), "Auditoría de Citas y Exportación Oficial", font=font_heading, fill=FOREST)
        
        # Filter Bar
        draw_rounded_rect(draw, [(win_x1 + 40, content_y + 60), (win_x2 - 40, content_y + 130)], 10, fill=(248, 250, 252), outline=BORDER, width=1)
        draw.text((win_x1 + 65, content_y + 85), "Rango: 01/11/2026 - 30/11/2026  |  Especialidad: Todas  |  Estado: Todas las citas", font=font_body, fill=SLATE_DARK)
        
        # Export CSV Button
        draw_rounded_rect(draw, [(win_x2 - 280, content_y + 70), (win_x2 - 60, content_y + 120)], 8, fill=FOREST)
        draw.text((win_x2 - 250, content_y + 83), "📥 Exportar a CSV", font=font_body_b, fill=LIME)

        # Audit Table Preview
        ty = content_y + 155
        draw.rectangle([(win_x1 + 40, ty), (win_x2 - 40, ty + 38)], fill=(241, 245, 249))
        draw.text((win_x1 + 60, ty + 8), "ID Turno", font=font_small_b, fill=SLATE_DARK)
        draw.text((win_x1 + 180, ty + 8), "Fecha/Hora", font=font_small_b, fill=SLATE_DARK)
        draw.text((win_x1 + 400, ty + 8), "Paciente", font=font_small_b, fill=SLATE_DARK)
        draw.text((win_x1 + 700, ty + 8), "Profesional", font=font_small_b, fill=SLATE_DARK)
        draw.text((win_x1 + 980, ty + 8), "Estado Final", font=font_small_b, fill=SLATE_DARK)

        rep_rows = [
            ("MED-9402", "24/11 09:30 AM", "Carlos Alberto Gómez", "Dr. Roberto Silva", "Confirmada", ACCENT_GREEN),
            ("MED-9401", "24/11 08:45 AM", "Ana Lucía Benítez", "Dr. Roberto Silva", "Atendida", FOREST),
            ("MED-9399", "23/11 04:00 PM", "Juan Pablo Restrepo", "Dra. Camila Morales", "No Asistió", ACCENT_RED)
        ]
        for i, (cid, f_h, pac, med, st_fin, st_col) in enumerate(rep_rows):
            ry = ty + 42 + (i * 65)
            draw_rounded_rect(draw, [(win_x1 + 40, ry), (win_x2 - 40, ry + 55)], 8, fill=(255, 255, 255), outline=BORDER, width=1)
            draw.text((win_x1 + 60, ry + 16), cid, font=font_body_b, fill=SLATE_DARK)
            draw.text((win_x1 + 180, ry + 16), f_h, font=font_body, fill=SLATE_MUTED)
            draw.text((win_x1 + 400, ry + 16), pac, font=font_body, fill=SLATE_DARK)
            draw.text((win_x1 + 700, ry + 16), med, font=font_body, fill=SLATE_DARK)
            
            # Badge
            draw_rounded_rect(draw, [(win_x1 + 980, ry + 10), (win_x1 + 1120, ry + 45)], 6, fill=st_col)
            draw.text((win_x1 + 1005, ry + 16), st_fin, font=font_small_b, fill=(255, 255, 255))

    # 4. Right Side Explanatory Cards (What it does, Key actions, Profile Relation)
    # Side card coordinates: 1400 x 210, right 1860, bottom 750
    sx1, sy1, sx2, sy2 = 1400, 210, 1860, 750
    draw_rounded_rect(draw, [(sx1, sy1), (sx2, sy2)], 16, fill=(255, 255, 255), outline=BORDER, width=2)
    
    # Side Card Header
    draw_rounded_rect(draw, [(sx1, sy1), (sx2, sy1 + 50)], 16, fill=(241, 245, 249))
    draw.rectangle([(sx1, sy1 + 35), (sx2, sy1 + 50)], fill=(241, 245, 249))
    draw.text((sx1 + 25, sy1 + 15), "ANÁLISIS DE PANTALLA", font=font_heading, fill=FOREST)

    # Section 1: ¿Qué hace?
    draw.text((sx1 + 25, sy1 + 75), "1. ¿QUÉ HACE ESTA PANTALLA?", font=font_small_b, fill=FOREST)
    # Wrap text manually
    w_text = scene["what_it_does"]
    words = w_text.split(" ")
    lines = []
    cur = ""
    for w in words:
        test = (cur + " " + w).strip()
        if len(test) < 38:
            cur = test
        else:
            lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    for idx, l in enumerate(lines[:3]):
        draw.text((sx1 + 25, sy1 + 105 + (idx * 26)), l, font=font_body, fill=SLATE_DARK)

    # Section 2: ¿Qué puede hacer el usuario?
    draw.text((sx1 + 25, sy1 + 205), "2. ACCIONES E INTERACCIONES", font=font_small_b, fill=FOREST)
    act_words = scene["key_actions"].split(" ")
    a_lines = []
    cur = ""
    for w in act_words:
        test = (cur + " " + w).strip()
        if len(test) < 38:
            cur = test
        else:
            a_lines.append(cur)
            cur = w
    if cur: a_lines.append(cur)
    for idx, l in enumerate(a_lines[:3]):
        draw.text((sx1 + 25, sy1 + 235 + (idx * 26)), l, font=font_body, fill=SLATE_DARK)

    # Section 3: Relación con otros perfiles
    draw.text((sx1 + 25, sy1 + 335), "3. RELACIÓN ENTRE PERFILES", font=font_small_b, fill=FOREST)
    rel_words = scene["relation"].split(" ")
    r_lines = []
    cur = ""
    for w in rel_words:
        test = (cur + " " + w).strip()
        if len(test) < 38:
            cur = test
        else:
            r_lines.append(cur)
            cur = w
    if cur: r_lines.append(cur)
    for idx, l in enumerate(r_lines[:3]):
        draw.text((sx1 + 25, sy1 + 365 + (idx * 26)), l, font=font_body, fill=SLATE_DARK)

    # Role Flow Indicator pill at bottom of side card
    draw_rounded_rect(draw, [(sx1 + 25, sy2 - 75), (sx2 - 25, sy2 - 20)], 10, fill=FOREST)
    flow_lbl = "PACIENTE ➔ DOCTOR ➔ ADMIN"
    draw.text((sx1 + 75, sy2 - 55), flow_lbl, font=font_small_b, fill=LIME)

    # 5. Bottom Subtitle & Audio Wave Bar
    # Coordinates: 60, 780 to 1860, 920
    draw_rounded_rect(draw, [(60, 780), (1860, 920)], 16, fill=(28, 58, 19))
    draw.text((100, 805), "🎙️ EXPLICACIÓN DEL SISTEMA:", font=font_small_b, fill=LIME)
    
    # Subtitle text
    sub_full = f"{scene['what_it_does']} {scene['relation']}"
    sub_words = sub_full.split(" ")
    s_lines = []
    cur = ""
    for w in sub_words:
        test = (cur + " " + w).strip()
        if len(test) < 110:
            cur = test
        else:
            s_lines.append(cur)
            cur = w
    if cur: s_lines.append(cur)
    for idx, l in enumerate(s_lines[:2]):
        draw.text((100, 840 + (idx * 32)), l, font=font_heading, fill=(255, 255, 255))

    # 6. Animated Cursor Spotlight & Click Effect
    click_x, click_y = scene["click_pos"]
    # Cursor animation based on progress_in_scene
    # Moves toward target, clicks at 50%
    t = progress_in_scene
    start_x, start_y = click_x - 120, click_y + 120
    if t < 0.4:
        cur_x = start_x + (click_x - start_x) * (t / 0.4)
        cur_y = start_y + (click_y - start_y) * (t / 0.4)
        is_click = False
    elif t < 0.7:
        cur_x, cur_y = click_x, click_y
        is_click = True
        ripple_r = int((t - 0.4) / 0.3 * 40)
        draw.ellipse([(click_x - ripple_r, click_y - ripple_r), (click_x + ripple_r, click_y + ripple_r)], outline=(211, 250, 153), width=3)
    else:
        cur_x, cur_y = click_x, click_y
        is_click = False

    # Draw cursor arrow
    cur_pts = [
        (cur_x, cur_y),
        (cur_x + 18, cur_y + 18),
        (cur_x + 8, cur_y + 18),
        (cur_x + 14, cur_y + 28),
        (cur_x + 8, cur_y + 30),
        (cur_x + 2, cur_y + 20),
        (cur_x, cur_y + 24)
    ]
    draw.polygon(cur_pts, fill=(255, 255, 255), outline=(0, 0, 0))

    # 7. Timeline Scrubber Bar at Bottom
    draw.rectangle([(0, HEIGHT - 24), (WIDTH, HEIGHT)], fill=(15, 23, 42))
    overall_progress = min(1.0, elapsed_time / total_time)
    draw.rectangle([(0, HEIGHT - 24), (int(WIDTH * overall_progress), HEIGHT)], fill=LIME)
    time_str = f"{int(elapsed_time//60):02d}:{int(elapsed_time%60):02d} / {int(total_time//60):02d}:{int(total_time%60):02d}"
    draw.text((WIDTH - 160, HEIGHT - 20), time_str, font=font_small_b, fill=(255, 255, 255))

    return im

def generate_video_and_audio():
    total_time = sum(s["duration_sec"] for s in SCENES)
    total_frames = int(total_time * FPS)
    print(f"Total time: {total_time:.1f}s, Total frames: {total_frames} @ {FPS} fps")

    # Output paths
    output_mp4 = r"c:\Users\SENA\Desktop\MediTurno\MediTurno\MediTurno_Video_Presentacion_Teams.mp4"
    audio_wav = r"c:\Users\SENA\Desktop\MediTurno\MediTurno\temp_audio.wav"
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    # 1. Generate Audio (Gentle notification beeps / chords at scene transitions)
    sample_rate = 44100
    total_samples = int(total_time * sample_rate)
    audio_samples = []

    # Map scenes to start samples
    scene_start_times = []
    acc = 0.0
    for s in SCENES:
        scene_start_times.append(acc)
        acc += s["duration_sec"]

    for i in range(total_samples):
        t = i / sample_rate
        val = 0.0
        # Check if near transition
        for st in scene_start_times:
            diff = t - st
            if 0 <= diff <= 0.6:
                # Soft chime chord (440Hz + 660Hz)
                env = math.exp(-diff * 5)
                tone = 0.25 * math.sin(2 * math.pi * 523.25 * diff) + 0.15 * math.sin(2 * math.pi * 659.25 * diff)
                val += env * tone
        # Ensure within bounds
        val = max(-0.99, min(0.99, val))
        audio_samples.append(int(val * 32767))

    # Write WAV
    with wave.open(audio_wav, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        raw_bytes = struct.pack(f"<{len(audio_samples)}h", *audio_samples)
        wf.writeframes(raw_bytes)

    # 2. Start FFmpeg pipe for Video encoding
    import subprocess
    cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-i", audio_wav,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "128k",
        "-shortest",
        output_mp4
    ]

    pipe = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    # Render frames
    cur_frame = 0
    for s_idx, scene in enumerate(SCENES):
        dur = scene["duration_sec"]
        scene_frames = int(dur * FPS)
        for sf in range(scene_frames):
            prog = sf / scene_frames
            elapsed = (cur_frame / total_frames) * total_time
            img = render_scene_frame(scene, prog, total_time, elapsed)
            pipe.stdin.write(img.tobytes())
            cur_frame += 1

    pipe.stdin.close()
    pipe.wait()

    if os.path.exists(audio_wav):
        os.remove(audio_wav)

    print(f"Video created successfully at: {output_mp4}")
    print(f"File size: {os.path.getsize(output_mp4) / (1024*1024):.2f} MB")

if __name__ == "__main__":
    generate_video_and_audio()
