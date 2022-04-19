{
  "targets": [
    {
      "target_name": "VidyoAddon",
      "sources": [ "VidyoAddon.cc" ],
      'conditions': [
        ['OS=="mac"', {
          "copies":[
             {
                'destination': './connector/banuba_effects_and_resources',
                'files':[
                        "<!(echo $VIDYO_CLIENT_LIB_DIR)/Banuba/effects",
                        "<!(echo $VIDYO_CLIENT_LIB_DIR)/Banuba/BNBEffectPlayerC.framework/Resources/bnb-resources",
                     ]
             }
          ],
          "include_dirs" : [
             "<!(echo $VIDYO_CLIENT_INCL_DIR)",
             "<!(node -e \"require('nan')\")"
          ],
          "libraries": [
            "-framework CoreLocation",
            "-framework AVFoundation",
            "-F<!(echo $VIDYO_CLIENT_LIB_DIR)/Banuba -framework BNBEffectPlayerC",
            "<!(echo $VIDYO_CLIENT_LIB_DIR)/libvpx.a",
            "<!(echo $VIDYO_CLIENT_LIB_DIR)/libspeex.a",
            "<!(echo $VIDYO_CLIENT_LIB_DIR)/libopus.a",
            "<!(echo $VIDYO_CLIENT_LIB_DIR)/libsrtp2.a",
            "<!(echo $VIDYO_CLIENT_LIB_DIR)/libcrypto.a",
            "<!(echo $VIDYO_CLIENT_LIB_DIR)/libssl.a",
            "<!(echo $VIDYO_CLIENT_LIB_DIR)/libVidyoClient.a",
            "-Wl",
            "-rpath <!(echo $VIDYO_CLIENT_LIB_DIR)/Banuba",
         ],
          "xcode_settings": {
            'MACOSX_DEPLOYMENT_TARGET': '10.8'
          }
        }],
        ['OS=="win"', {
          "copies":[
                    { 
                        'destination': '<(module_root_dir)/build/Release',
                        'files':[
                           "<!(echo %VIDYO_CLIENT_LIB_DIR%)\\Banuba\\Release\\BNBEffectPlayerC.dll",
                           "<!(echo %VIDYO_CLIENT_LIB_DIR%)\\Banuba\\OpenAL32.dll",
                           "<(module_root_dir)/concrt140.dll",
                           "<(module_root_dir)/msvcp140.dll",
                           "<(module_root_dir)/vcruntime140.dll",
                           "<(module_root_dir)/vcruntime140_1.dll",                           
                        ]
                    },
                    { 
                        'destination': '<(module_root_dir)',
                        'files':[
                           "<!(echo %VIDYO_CLIENT_LIB_DIR%)\\Banuba\\Release\\BNBEffectPlayerC.dll",
                           "<!(echo %VIDYO_CLIENT_LIB_DIR%)\\Banuba\\OpenAL32.dll"                         
                        ]
                    }
                ],
          "include_dirs" : [
             "<!(echo %VIDYO_CLIENT_INCL_DIR%)",
             "<!(node -e \"require('nan')\")"
          ],
          "libraries": [
            "d3d9.lib",
            "opengl32.lib",
            "glu32.lib",
            "crypt32.lib",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\libssl",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\libspeex",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\opus",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\srtp2",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\libcrypto",
            '-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\VidyoClient',
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\vpxmt",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\Banuba\\Release\\BNBEffectPlayerC",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\zlibstat",
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
        "conditions": [
           ['OS=="mac"', {
              "actions": [
                 {
                    "action_name": "change_bnb_path",
                    "message": "Change Banuba framework path",
                    "inputs": [""],
                    "outputs": [""],
                    "action": ["eval", "install_name_tool -change @executable_path/../Frameworks/BNBEffectPlayerC.framework/Versions/A/BNBEffectPlayerC <!(echo $VIDYO_CLIENT_LIB_DIR)/Banuba/BNBEffectPlayerC.framework/Versions/A/BNBEffectPlayerC ./build/Release/VidyoAddon.node"],
                 }
              ],
           }],

         ['OS=="win"', {
              "actions": [
                      {
                        'variables': {
                         'source_dir' : '<(module_root_dir)\\VidyoClient-WinVS2017SDK\\lib\\windows\\resources\\Banuba',
                         'dest_dir' : '<(module_root_dir)\\connector\\banuba_effects_and_resources',
                     },
                    "action_name": "post_build_event",
                    "message": "Copy Banuba effects and resources to connector folder..",
                    "inputs": [""],
                    "outputs": [""],
                    "action": ['python', 'copy-bnb.py' ,'<(source_dir)' , '<(dest_dir)' ],
                 },
               ],
           }],
        ],
    }
  ]
}

