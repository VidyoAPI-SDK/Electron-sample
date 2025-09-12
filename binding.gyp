{
  "targets": [
    {
      "target_name": "VidyoAddon",
      "sources": [ "VidyoAddon.cc" ],
      'variables' : {
        'sdk_lib_dir_mac':"<(module_root_dir)/VidyoClient-OSXSDK/lib/macos",
        'sdk_incl_dir_mac':"<(module_root_dir)/VidyoClient-OSXSDK/include"
      },
      'conditions': [
        ['OS=="mac"', {
          "copies":[
             {
                'destination': './connector/banuba_effects_and_resources',
                'files':[
                        "<(sdk_lib_dir_mac)/Banuba/effects",
                        "<(sdk_lib_dir_mac)/Banuba/BNBEffectPlayerC.framework/Resources/bnb-resources",
                     ]
             }
          ],
          "include_dirs" : [
             "<(sdk_incl_dir_mac)",
             "<!(node -e \"require('nan')\")"
          ],
          "libraries": [
            "-framework CoreLocation",
            "-framework AVFoundation",
            "-Wl",
            "-rpath <(sdk_lib_dir_mac)/Banuba",
         ],
         # Architecture-specific framework paths
         'conditions': [
           ['target_arch=="arm64"', {
             "libraries": [
               "-F<(sdk_lib_dir_mac)/VidyoClientMacOS.xcframework/macos-arm64 -framework VidyoClientMacOS",
               "-rpath <(sdk_lib_dir_mac)/VidyoClientMacOS.xcframework/macos-arm64",
             ]
           }],
           ['target_arch=="x64"', {
             "libraries": [
               "-F<(sdk_lib_dir_mac)/VidyoClientMacOS.xcframework/macos-x86_64 -framework VidyoClientMacOS",
               "-rpath <(sdk_lib_dir_mac)/VidyoClientMacOS.xcframework/macos-x86_64",
             ]
           }]
         ],
          "xcode_settings": {
            'MACOSX_DEPLOYMENT_TARGET': '10.8',
            'OTHER_LDFLAGS': ['-headerpad_max_install_names']
          }
        }],
        ['OS=="win"', {
             'variables': {
             'SDK_LIB_DIR' : '<(module_root_dir)\\VidyoClient-WinVS2017SDK\\lib\\windows\\x64\\Release\\',
             'SDK_INCL_DIR' : '<(module_root_dir)\\VidyoClient-WinVS2017SDK\\include\\',
          },
          "copies":[
                    {
                        'destination': '<(module_root_dir)/build/Release',
                        'files':[
                           "<(SDK_LIB_DIR)\\Banuba\\Release\\BNBEffectPlayerC.dll",
                           "<(SDK_LIB_DIR)\\Banuba\\OpenAL32.dll",
                           "<(module_root_dir)/concrt140.dll",
                           "<(module_root_dir)/msvcp140.dll",
                           "<(module_root_dir)/vcruntime140.dll",
                           "<(module_root_dir)/vcruntime140_1.dll",
                        ]
                    },
                    {
                        'destination': '<(module_root_dir)',
                        'files':[
                           "<(SDK_LIB_DIR)\\Banuba\\Release\\BNBEffectPlayerC.dll",
                           "<(SDK_LIB_DIR)\\Banuba\\OpenAL32.dll"
                        ]
                    }
                ],
          "include_dirs" : [
             "<(SDK_INCL_DIR)",
             "<!(node -e \"require('nan')\")"
          ],
          "libraries": [
            "d3d9.lib",
            "opengl32.lib",
            "glu32.lib",
            "crypt32.lib",
            "-l<(SDK_LIB_DIR)\\libssl",
            "-l<(SDK_LIB_DIR)\\libspeex",
            "-l<(SDK_LIB_DIR)\\opus",
            "-l<(SDK_LIB_DIR)\\srtp2",
            "-l<(SDK_LIB_DIR)\\libcrypto",
            '-l<(SDK_LIB_DIR)\\VidyoClient',
            "-l<(SDK_LIB_DIR)\\vpxmt",
            "-l<(SDK_LIB_DIR)\\Banuba\\Release\\BNBEffectPlayerC",
            "-l<(SDK_LIB_DIR)\\zlibstat",
          ],
          'configurations': {
            'Debug': {
              'msvs_settings': {
                'VCLinkerTool': {
                    'AdditionalOptions': [
                      '/FORCE:MULTIPLE',
                      '/LTCG:OFF',
                    ]
                  },
                  'VCCLCompilerTool': {
                    'Optimization': 0
                  }
              }
            },
            'Release': {
              'msvs_settings': {
                'VCLinkerTool': {
                  'AdditionalOptions': [
                    '/FORCE:MULTIPLE',
                    '/LTCG:OFF',
                  ]
                },
                'VCCLCompilerTool': {
                  'Optimization': 0
                }
              }
            }
          }
        }],
      ],
    },
    {
        "target_name": "post_build",
        "type": "none",
        "conditions": [],
    }
  ]
}

