<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MediTurno — Sistema de Gestión y Programación de Citas Médicas</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap"
      rel="stylesheet"
    />
    <script>
      (function() {
        try {
          const theme = localStorage.getItem('mediturno_theme');
          if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } catch (e) {}
      })();
    </script>
    <script type="module" crossorigin src="/assets/index-CVz7t9KF.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-DxwgSx9D.css">
  </head>
  <body class="bg-[#fcfcf7] dark:bg-[#0d170a] text-[#1c3a13] dark:text-[#fcfcf7] antialiased selection:bg-[#d3fa99] selection:text-[#1c3a13] transition-colors duration-200">
    <div id="root"></div>
  </body>
</html>
