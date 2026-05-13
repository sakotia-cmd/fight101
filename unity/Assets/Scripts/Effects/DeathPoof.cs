// DeathPoof.cs — quick "shards fly out and fade" effect when an enemy dies.
//
// 8 small colored sprite shards radiate from the death position. Each
// shrinks and fades over ~0.4s, then the whole DeathPoof GO destroys
// itself. Placeholder until U10's real particle systems.

using System.Collections;
using UnityEngine;

public class DeathPoof : MonoBehaviour
{
    const int   ShardCount = 8;
    const float Life       = 0.4f;
    const float Speed      = 80f;   // units/sec — fast enough to be punchy

    public static void Spawn(Vector3 worldPos, Sprite sprite, Color color)
    {
        var go = new GameObject("DeathPoof");
        go.transform.position = worldPos;
        var poof = go.AddComponent<DeathPoof>();
        poof.StartCoroutine(poof.Run(sprite, color));
    }

    IEnumerator Run(Sprite sprite, Color color)
    {
        var srs = new SpriteRenderer[ShardCount];
        var vels = new Vector2[ShardCount];

        for (int i = 0; i < ShardCount; i++)
        {
            var shard = new GameObject("Shard");
            shard.transform.SetParent(transform, false);
            shard.transform.localScale = new Vector3(5f, 5f, 1f);

            srs[i] = shard.AddComponent<SpriteRenderer>();
            srs[i].sprite = sprite;
            srs[i].color = color;
            srs[i].sortingOrder = 250;   // above buildings, below sword

            float angle = (i + Random.value) * Mathf.PI * 2f / ShardCount;
            vels[i] = new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * Speed;
        }

        float t = 0f;
        while (t < Life)
        {
            t += Time.deltaTime;
            float k = Mathf.Clamp01(t / Life);
            for (int i = 0; i < ShardCount; i++)
            {
                if (srs[i] == null) continue;
                srs[i].transform.position += (Vector3)(vels[i] * Time.deltaTime);
                var c = srs[i].color;
                c.a = 1f - k;
                srs[i].color = c;
                float sz = 5f * (1f - 0.4f * k);
                srs[i].transform.localScale = new Vector3(sz, sz, 1f);
            }
            yield return null;
        }

        Destroy(gameObject);
    }
}
