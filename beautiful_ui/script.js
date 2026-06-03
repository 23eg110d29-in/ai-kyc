document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.glass-nav');
    
    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply animation to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.15}s`;
        observer.observe(card);
    });

    // Mouse parallax effect for hero visual
    const heroVisual = document.querySelector('.hero-visual');
    const glassCard = document.querySelector('.hero-glass-card');
    
    if (heroVisual && glassCard) {
        heroVisual.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            
            glassCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        heroVisual.addEventListener('mouseenter', () => {
            glassCard.style.transition = 'none';
        });

        heroVisual.addEventListener('mouseleave', () => {
            glassCard.style.transition = 'all 0.5s ease';
            glassCard.style.transform = `rotateY(0deg) rotateX(0deg)`;
        });
    }
});
