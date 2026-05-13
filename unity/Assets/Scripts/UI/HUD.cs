// HUD.cs — health bar + game-over overlay + weapon panel + counters.
//
// Uses TextMeshPro for crisp signed-distance-field text at any scale.
// Image fields stay on uGUI (TMP doesn't replace those).
//
// Health bar: a filled Image. Color shifts green → orange → red as HP
// drops, matching drawHealthBar() in combat.js.

using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class HUD : MonoBehaviour
{
    public Image healthFill;
    public TextMeshProUGUI healthText;
    public GameObject gameOverPanel;

    // Weapon panel (added in U4).
    public TextMeshProUGUI weaponLabel;       // "Wood Sword" / "Fire Bow" / etc.
    public Image           weaponIconBg;      // colored chip behind the slot letter
    public TextMeshProUGUI weaponIconLetter;  // "S" / "B" / "G" / "T"
    public Image[]         slotChips;         // 4 chips for slots 1-4
    public TextMeshProUGUI coinText;          // top-right coin counter
    public TextMeshProUGUI hamburgerText;     // top-right hamburger counter

    void Awake()
    {
        GameEvents.PlayerDied    += OnPlayerDied;
        GameEvents.GameRestarted += OnRestart;
    }

    void OnDestroy()
    {
        GameEvents.PlayerDied    -= OnPlayerDied;
        GameEvents.GameRestarted -= OnRestart;
    }

    void Start()
    {
        OnRestart();   // initial state
    }

    void Update()
    {
        if (healthFill == null) return;
        float pct = GameState.playerMaxHP > 0
            ? Mathf.Clamp01((float)GameState.playerHP / GameState.playerMaxHP)
            : 0f;
        healthFill.fillAmount = pct;
        healthFill.color =
            pct > 0.5f  ? new Color(0f, 0.8f, 0.27f) :
            pct > 0.25f ? new Color(1f, 0.67f, 0f) :
                          new Color(1f, 0.13f, 0.13f);
        if (healthText != null)
            healthText.text = $"{GameState.playerHP} / {GameState.playerMaxHP}";

        UpdateWeaponPanel();
        UpdateInventoryText();

        // R to restart from the game-over overlay.
        if (GameState.gameOver && PlayerInput.RestartPressed())
        {
            GameEvents.RaiseGameRestarted();
        }
    }

    void UpdateWeaponPanel()
    {
        var inv = Inventory.Instance;
        if (inv == null) return;

        ref var w = ref inv.CurrentWeapon;
        ref var e = ref inv.CurrentElement;

        if (weaponLabel != null) weaponLabel.text = $"{e.name} {w.name}";
        if (weaponIconBg != null) weaponIconBg.color = e.color;
        if (weaponIconLetter != null) weaponIconLetter.text = w.name.Substring(0, 1);

        if (slotChips != null)
        {
            for (int i = 0; i < slotChips.Length; i++)
            {
                if (slotChips[i] == null) continue;
                bool owned  = i < inv.ownedWeapons.Length && inv.ownedWeapons[i];
                bool active = (int)inv.equipped == i;
                slotChips[i].color = active
                    ? new Color(1f, 0.8f, 0f)
                    : (owned ? new Color(0.4f, 0.4f, 0.4f) : new Color(0.2f, 0.2f, 0.2f));
            }
        }
    }

    void UpdateInventoryText()
    {
        // Drop the "$ " / "Burgers " prefixes — the inline icon set up by
        // U4Setup carries that meaning visually.
        if (coinText != null)
            coinText.text = GameState.playerCoins.ToString();
        if (hamburgerText != null && Inventory.Instance != null)
            hamburgerText.text = Inventory.Instance.hamburgers.ToString();
    }

    void OnPlayerDied()
    {
        if (gameOverPanel != null) gameOverPanel.SetActive(true);
    }

    void OnRestart()
    {
        if (gameOverPanel != null) gameOverPanel.SetActive(false);
    }
}
