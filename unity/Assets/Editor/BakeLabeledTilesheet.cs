// BakeLabeledTilesheet.cs — produces Assets/Sprites/Kenney/Labeled.png, a
// 4× upscaled copy of the Kenney tilesheet with each tile's index printed
// in a yellow tag in its top-left corner. The image is for human / Claude
// inspection only — it's not imported as a sprite.
//
// Why: Read tool downsamples 16×16 tiles into indistinguishable thumbnails.
// At 4× upscale (64×64 per tile) the tiles + their indices are legible.
//
// Run from CLI:
//   Unity -batchmode -quit -projectPath unity \
//         -executeMethod BakeLabeledTilesheet.Run \
//         -logFile /tmp/bake.log

#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEngine;

public static class BakeLabeledTilesheet
{
    const string SrcPath = "Assets/Sprites/Kenney/Tilemap/tilemap_packed.png";
    const string DstPath = "Assets/Sprites/Kenney/Labeled.png";
    const int TileSize = 16;
    const int Cols     = 37;
    const int Rows     = 28;
    const int Scale    = 4;

    public static void Run()
    {
        try
        {
            Bake();
            AssetDatabase.Refresh();
            Debug.Log($"BakeLabeledTilesheet: wrote {DstPath}");
            EditorApplication.Exit(0);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"BakeLabeledTilesheet failed: {e}");
            EditorApplication.Exit(1);
        }
    }

    static void Bake()
    {
        // Read the PNG bytes directly so we don't depend on the tilesheet's
        // import settings being Readable.
        byte[] bytes = File.ReadAllBytes(SrcPath);
        var src = new Texture2D(2, 2, TextureFormat.RGBA32, false);
        if (!src.LoadImage(bytes)) throw new System.Exception("LoadImage failed");

        int srcW = src.width;
        int srcH = src.height;
        if (srcW != Cols * TileSize || srcH != Rows * TileSize)
            throw new System.Exception($"unexpected size {srcW}x{srcH}");

        int dstW = srcW * Scale;
        int dstH = srcH * Scale;

        var srcPx = src.GetPixels32();
        var dstPx = new Color32[dstW * dstH];

        // 4× nearest-neighbor upscale.
        for (int y = 0; y < dstH; y++)
        {
            int sy = y / Scale;
            int srcRowOffset = sy * srcW;
            int dstRowOffset = y * dstW;
            for (int x = 0; x < dstW; x++)
            {
                int sx = x / Scale;
                dstPx[dstRowOffset + x] = srcPx[srcRowOffset + sx];
            }
        }

        // Draw the per-tile index labels.
        Color32 bg = new Color32(255, 255, 0, 255);   // yellow background
        Color32 fg = new Color32(0, 0, 0, 255);       // black text

        // Tag layout: 4 digits × 5px wide + 3 gaps × 1px + 2px padding = 25w × 9h
        const int TagW = 25;
        const int TagH = 9;

        for (int r = 0; r < Rows; r++)
        {
            for (int c = 0; c < Cols; c++)
            {
                int idx = r * Cols + c;

                // Tile in dst coords (Unity bottom-left origin): col c left
                // edge at x=c*64, row r top edge at y = dstH - r*64.
                int tileX0 = c * TileSize * Scale;
                int tileY1 = dstH - r * TileSize * Scale;   // top of tile

                // Tag sits 1px in from the tile's top-left corner.
                int tagX0 = tileX0 + 1;
                int tagY1 = tileY1 - 1;
                int tagY0 = tagY1 - TagH;
                int tagX1 = tagX0 + TagW;

                // Yellow background.
                for (int yy = tagY0; yy < tagY1; yy++)
                {
                    int rowOff = yy * dstW;
                    for (int xx = tagX0; xx < tagX1; xx++)
                        dstPx[rowOff + xx] = bg;
                }

                // 4 digits, MSB first.
                int d3 = idx / 1000;
                int d2 = (idx / 100) % 10;
                int d1 = (idx / 10) % 10;
                int d0 = idx % 10;

                DrawGlyph(dstPx, dstW, tagX0 + 1 + 0 * 6, tagY1 - 1, d3, fg);
                DrawGlyph(dstPx, dstW, tagX0 + 1 + 1 * 6, tagY1 - 1, d2, fg);
                DrawGlyph(dstPx, dstW, tagX0 + 1 + 2 * 6, tagY1 - 1, d1, fg);
                DrawGlyph(dstPx, dstW, tagX0 + 1 + 3 * 6, tagY1 - 1, d0, fg);
            }
        }

        var dst = new Texture2D(dstW, dstH, TextureFormat.RGBA32, false);
        dst.SetPixels32(dstPx);
        dst.Apply(false);

        File.WriteAllBytes(DstPath, dst.EncodeToPNG());
        Debug.Log($"BakeLabeledTilesheet: {dstW}x{dstH}, {Cols * Rows} tiles labeled");
    }

    // Draw a 5×7 glyph with its top-left at (x, y) in Unity bottom-left coords.
    // y is the top row of the glyph; we step downward (decreasing y) for each row.
    static void DrawGlyph(Color32[] dst, int dstW, int x, int y, int digit, Color32 col)
    {
        byte[] g = Font5x7[digit];
        for (int gy = 0; gy < 7; gy++)
        {
            byte row = g[gy];
            int py = y - gy;
            int rowOff = py * dstW;
            for (int gx = 0; gx < 5; gx++)
            {
                if ((row & (1 << (4 - gx))) != 0)
                    dst[rowOff + x + gx] = col;
            }
        }
    }

    // 5×7 bitmap font for digits 0–9. Each byte = one row; bit 4 = leftmost
    // column, bit 0 = rightmost. Row 0 is the top of the glyph.
    static readonly byte[][] Font5x7 = new byte[][]
    {
        // 0
        new byte[] { 0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E },
        // 1
        new byte[] { 0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E },
        // 2
        new byte[] { 0x0E, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1F },
        // 3
        new byte[] { 0x1E, 0x01, 0x01, 0x0E, 0x01, 0x01, 0x1E },
        // 4
        new byte[] { 0x11, 0x11, 0x11, 0x1F, 0x01, 0x01, 0x01 },
        // 5
        new byte[] { 0x1F, 0x10, 0x1E, 0x01, 0x01, 0x11, 0x0E },
        // 6
        new byte[] { 0x0E, 0x10, 0x10, 0x1E, 0x11, 0x11, 0x0E },
        // 7
        new byte[] { 0x1F, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08 },
        // 8
        new byte[] { 0x0E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E },
        // 9
        new byte[] { 0x0E, 0x11, 0x11, 0x0F, 0x01, 0x01, 0x0E },
    };
}
#endif
