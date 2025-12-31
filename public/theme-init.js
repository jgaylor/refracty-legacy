(function() {
  try {
    var appearance = localStorage.getItem('appearance-preference') || 'dark';
    var theme = 'dark';
    
    if (appearance === 'light') {
      theme = 'light';
    } else if (appearance === 'dark') {
      theme = 'dark';
    } else {
      // appearance === 'system'
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    // Fallback to dark if anything fails
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

