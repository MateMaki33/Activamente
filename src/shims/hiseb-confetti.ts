const confetti = () => {
  if (typeof window === "undefined") return;
  const total = 18;
  for (let i = 0; i < total; i += 1) {
    const piece = document.createElement("span");
    piece.className = "pointer-events-none fixed z-50 h-2 w-2 rounded-full";
    piece.style.left = `${15 + Math.random() * 70}%`;
    piece.style.top = "45%";
    piece.style.background = ["#22c55e", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"][i % 5];
    piece.style.transition = "transform 900ms ease-out, opacity 900ms ease-out";
    piece.style.opacity = "1";
    document.body.appendChild(piece);
    requestAnimationFrame(() => {
      piece.style.transform = `translate(${(Math.random() - 0.5) * 220}px, ${120 + Math.random() * 120}px) rotate(${Math.random() * 520}deg)`;
      piece.style.opacity = "0";
    });
    setTimeout(() => piece.remove(), 950);
  }
};

export default confetti;
