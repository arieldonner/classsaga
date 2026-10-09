export default function RewardPopup({ image, imageAlt, title, subtitle, hint, onClose }) {
    return (
        <div className="reward-popup" onClick={onClose}>
            <div className="reward-card">
                {image && <img src={image} alt={imageAlt || ""} className="reward-img" />}
                <div className="reward-title">{title}</div>
                {subtitle && <div className="reward-sub">{subtitle}</div>}
                {hint && <div className="reward-hint">{hint}</div>}
            </div>
        </div>
    );
}
