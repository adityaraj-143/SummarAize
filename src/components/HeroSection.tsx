const HeroSection = () => {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <h1 className="mb-6 animate-slide-up text-5xl font-bold md:text-6xl">
        Transform PDFs into Smart <span className="gradient-text">Summaries</span> with AI!
      </h1>

      <p
        className="mx-auto mb-8 max-w-2xl animate-slide-up text-xl text-muted-foreground"
        style={{ animationDelay: "0.2s" }}
      >
        Upload your PDFs and let AI generate concise, accurate summaries in seconds. Save time, stay
        informed!
      </p>
    </div>
  );
};

export default HeroSection;
