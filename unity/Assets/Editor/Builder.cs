// Builder.cs — batch-mode WebGL build entry point.
//
// Called from unity/build-webgl.sh so we can build without clicking through
// File → Build Settings every session. The .sh script handles the Unity
// invocation; this is just the C# hook it points at.

#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

public static class Builder
{
    public static void BuildWebGL()
    {
        // Build every scene that's checked in Build Settings, in order.
        var scenes = new System.Collections.Generic.List<string>();
        foreach (var s in EditorBuildSettings.scenes)
        {
            if (s.enabled) scenes.Add(s.path);
        }

        if (scenes.Count == 0)
        {
            Debug.LogError("Builder: no enabled scenes in Build Settings. Add at least Boot.unity.");
            EditorApplication.Exit(1);
            return;
        }

        string outDir = Path.Combine(Directory.GetCurrentDirectory(), "Build", "WebGL");
        Directory.CreateDirectory(outDir);

        // Disable Brotli/Gzip compression so plain Python http.server can serve
        // the build without setting Content-Encoding headers. Trade: build is
        // ~3x bigger (~30 MB vs ~14 MB) but works on any static server.
        PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Disabled;

        var opts = new BuildPlayerOptions
        {
            scenes = scenes.ToArray(),
            locationPathName = outDir,
            target = BuildTarget.WebGL,
            options = BuildOptions.None,
        };

        BuildReport report = BuildPipeline.BuildPlayer(opts);
        BuildSummary s2 = report.summary;

        if (s2.result == BuildResult.Succeeded)
        {
            Debug.Log($"Builder: WebGL build succeeded -> {outDir} ({s2.totalSize} bytes)");
            EditorApplication.Exit(0);
        }
        else
        {
            Debug.LogError($"Builder: WebGL build FAILED ({s2.totalErrors} errors)");
            EditorApplication.Exit(1);
        }
    }
}
#endif
