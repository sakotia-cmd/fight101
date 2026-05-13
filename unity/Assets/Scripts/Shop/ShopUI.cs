// ShopUI.cs — TMP overlay that renders the shop panel and handles input.
//
// Input map:
//   E    open (handled by Shopkeeper.cs when player is nearby + insideHideout)
//   Up/Down  navigate
//   Enter    buy selected
//   Esc      close
//
// Renders a scrolling list of all 18 items. Selected row gets a gold tint,
// price text turns red if you can't afford it, "OWNED" badge on one-time
// items already bought.

using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class ShopUI : MonoBehaviour
{
    public GameObject panel;       // root panel that toggles with shop state
    public TextMeshProUGUI title;       // "SHOP" / coin count line
    public TextMeshProUGUI coinLine;
    public RectTransform   listParent;
    public TextMeshProUGUI messageText;

    public TMP_FontAsset font;     // assigned by U5Setup

    readonly List<RowWidgets> rows = new();

    struct RowWidgets
    {
        public GameObject       root;
        public TextMeshProUGUI  name;
        public TextMeshProUGUI  price;
        public TextMeshProUGUI  desc;
        public TextMeshProUGUI  owned;
        public Image            bg;
    }

    void Awake()
    {
        BuildRows();
        Hide();
    }

    void BuildRows()
    {
        if (listParent == null || font == null) return;

        const float rowH = 42f;
        for (int i = 0; i < Shop.Items.Length; i++)
        {
            var rowGo = new GameObject($"row_{i}", typeof(RectTransform), typeof(Image));
            rowGo.transform.SetParent(listParent, false);
            var rowRT = rowGo.GetComponent<RectTransform>();
            rowRT.anchorMin = new Vector2(0f, 1f);
            rowRT.anchorMax = new Vector2(1f, 1f);
            rowRT.pivot     = new Vector2(0.5f, 1f);
            rowRT.anchoredPosition = new Vector2(0f, -i * rowH);
            rowRT.sizeDelta = new Vector2(0f, rowH - 4f);

            var rw = new RowWidgets
            {
                root  = rowGo,
                bg    = rowGo.GetComponent<Image>(),
                name  = MakeText(rowGo.transform, "name",  new Rect(10f,  -2f, 0.55f, 22f), font, 14, TextAlignmentOptions.TopLeft,  Color.white,  bold: true),
                price = MakeText(rowGo.transform, "price", new Rect(10f, -22f, 0.40f, 16f), font, 12, TextAlignmentOptions.TopLeft,  new Color(1f, 0.84f, 0f), bold: false),
                desc  = MakeText(rowGo.transform, "desc",  new Rect(140f, -8f, 0.95f, 22f), font, 11, TextAlignmentOptions.TopLeft,  new Color(0.6f, 0.6f, 0.75f), bold: false),
                owned = MakeText(rowGo.transform, "owned", new Rect(-80f, -8f, 0.95f, 22f), font, 11, TextAlignmentOptions.TopRight, new Color(0.3f, 0.7f, 0.3f), bold: true),
            };
            rw.bg.color = new Color(0f, 0f, 0f, 0f);   // transparent unless selected

            rows.Add(rw);
        }
    }

    static TextMeshProUGUI MakeText(Transform parent, string name, Rect r,
                                    TMP_FontAsset font, int sz,
                                    TextAlignmentOptions anchor, Color color, bool bold)
    {
        var go = new GameObject(name, typeof(RectTransform), typeof(TextMeshProUGUI));
        go.transform.SetParent(parent, false);
        var rt = go.GetComponent<RectTransform>();
        rt.anchorMin = new Vector2(0f, 1f);
        rt.anchorMax = new Vector2(1f, 1f);
        rt.pivot = new Vector2(0f, 1f);
        rt.anchoredPosition = new Vector2(r.x, r.y);
        rt.sizeDelta = new Vector2(-Mathf.Abs(r.x) * 0.5f, r.height);
        var t = go.GetComponent<TextMeshProUGUI>();
        t.font = font;
        t.fontSize = sz;
        t.alignment = anchor;
        t.color = color;
        t.fontStyle = bold ? FontStyles.Bold : FontStyles.Normal;
        t.enableWordWrapping = false;
        t.overflowMode = TextOverflowModes.Overflow;
        return t;
    }

    public void Show() { if (panel != null) panel.SetActive(true); }
    public void Hide() { if (panel != null) panel.SetActive(false); }

    void Update()
    {
        var shop = Shop.Instance;
        if (shop == null) return;

        if (shop.isOpen != (panel != null && panel.activeSelf))
        {
            if (shop.isOpen) Show(); else Hide();
        }

        if (!shop.isOpen) return;

        if (Input.GetKeyDown(KeyCode.UpArrow))    shop.Move(-1);
        if (Input.GetKeyDown(KeyCode.DownArrow))  shop.Move( 1);
        if (Input.GetKeyDown(KeyCode.Return) ||
            Input.GetKeyDown(KeyCode.KeypadEnter)) shop.BuySelected();
        if (Input.GetKeyDown(KeyCode.Escape))     shop.Close();

        RefreshRows();
        if (coinLine != null) coinLine.text = $"Your coins: {GameState.playerCoins}";
        if (messageText != null)
        {
            messageText.text = shop.messageFrames > 0 ? shop.message : "";
            if (shop.messageFrames > 0)
            {
                messageText.color = (shop.message.Contains("Not")
                                      || shop.message.Contains("full")
                                      || shop.message.Contains("Already"))
                    ? new Color(1f, 0.3f, 0.3f) : new Color(0.3f, 1f, 0.3f);
            }
        }
    }

    void RefreshRows()
    {
        for (int i = 0; i < rows.Count; i++)
        {
            var r    = rows[i];
            var item = Shop.Items[i];
            bool selected = i == Shop.Instance.selectedIndex;
            bool canAfford = GameState.playerCoins >= item.price;

            r.name.text = item.name;
            r.name.color = selected ? new Color(1f, 0.84f, 0f) : new Color(0.85f, 0.85f, 0.85f);
            r.price.text = item.price + " coins";
            r.price.color = canAfford ? new Color(1f, 0.84f, 0f) : new Color(1f, 0.3f, 0.3f);
            r.desc.text = item.desc;
            r.bg.color = selected ? new Color(1f, 0.84f, 0f, 0.15f) : new Color(0f, 0f, 0f, 0f);

            r.owned.text = Shop.IsOwned(i) ? "OWNED" : "";
        }
    }
}
