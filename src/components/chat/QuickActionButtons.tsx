interface QuickActionButtonsProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

const actions = [
  { label: "🔥 Show Deals", message: "Show me the best deals and popular products" },
  { label: "🛒 View Cart", message: "Show me my cart" },
  { label: "💻 Laptops", message: "Show me laptops" },
  { label: "📱 Phones", message: "Show me smartphones" },
  { label: "🎧 Audio", message: "Show me headphones and earbuds" },
  { label: "👟 Shoes", message: "Show me shoes" },
];

export function QuickActionButtons({ onAction, disabled }: QuickActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.message)}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-medium rounded-full bg-surface text-surface-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
