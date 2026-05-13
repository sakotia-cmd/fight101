// ImportTMP.cs — one-shot Editor utility that imports TextMeshPro's
// "Essential Resources" (default font asset + settings) so TMP_Text
// components have something to render.
//
// In Unity 6 the runtime is bundled inside com.unity.ugui, but the default
// font asset is still gated behind a .unitypackage you'd normally import
// via Window → TextMeshPro → Import TMP Essentials. We do it from CLI so
// no Editor clicks are needed.
//
// Idempotent: if the assets are already imported, the call is a no-op.
//
// Run from CLI:
//   Unity -batchmode -quit -projectPath unity -executeMethod ImportTMP.Run

#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.PackageManager;
using UnityEditor.PackageManager.Requests;
using UnityEngine;

public static class ImportTMP
{
    public static void Run()
    {
        try
        {
            // Find the package on disk. The numeric hash suffix in the
            // folder name varies between installs.
            string root = "Library/PackageCache";
            string match = null;
            if (Directory.Exists(root))
            {
                foreach (var d in Directory.GetDirectories(root, "com.unity.ugui@*"))
                {
                    var candidate = Path.Combine(d, "Package Resources", "TMP Essential Resources.unitypackage");
                    if (File.Exists(candidate)) { match = candidate; break; }
                }
            }
            if (match == null)
            {
                Debug.LogWarning("ImportTMP: could not find TMP Essential Resources.unitypackage; skipping.");
                EditorApplication.Exit(0);
                return;
            }

            // Already imported? The font asset shows up here after import.
            if (File.Exists("Assets/TextMesh Pro/Resources/Fonts & Materials/LiberationSans SDF.asset"))
            {
                Debug.Log("ImportTMP: TMP Essentials already imported; skipping.");
                EditorApplication.Exit(0);
                return;
            }

            AssetDatabase.ImportPackage(match, interactive: false);
            AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
            Debug.Log($"ImportTMP: imported {match}");
            EditorApplication.Exit(0);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"ImportTMP failed: {e}");
            EditorApplication.Exit(1);
        }
    }
}
#endif
