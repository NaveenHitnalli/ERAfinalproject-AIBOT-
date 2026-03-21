interface QuickActionButtonsProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

const actions = [
  { label: "👗 Trending Dresses", message: "Show me trending dresses for women right now" },
  { label: "🔥 Best Deals", message: "Show me the best fashion deals across all platforms" },
  { label: "👔 Men's Collection", message: "Show me popular men's shirts and jackets" },
  { label: "🆚 Compare Prices", message: "Compare kurti prices across Myntra, AJIO, and Meesho" },
  { label: "💃 Party Outfits", message: "Suggest a complete party outfit for women with accessories" },
  { label: "👶 Kids' Wear", message: "Show me kids' party wear and casual dresses" },
];

export function QuickActionButtons({ onAction, disabled }: QuickActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.message)}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card text-foreground hover:bg-primary/5 hover:border-primary/30 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-default"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
