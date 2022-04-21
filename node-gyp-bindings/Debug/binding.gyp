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
             },
               {
              'destination': './connector/lib',
              'files':[
                     '<(module_root_dir)/VidyoClient-OSXSDK/javascript',
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
           # "-F<!(echo $VIDYO_CLIENT_LIB_DIR)/Banuba -framework BNBEffectPlayerC",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libvpx.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libspeex.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libopus.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libsrtp2.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libcrypto.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libssl.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libL16Plugin.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiAnalytics.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiAudioCommon.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCalendar.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiClient.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCmcp.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCmcpPlugIn.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiConferenceUi.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCsConfClient.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCsConfData.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCsConfMsg.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCsConnMgr.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCsContactMgr.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCsEmcp.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCsEpClient.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCsTls.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCsUtils.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCsVidyoProxy.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiCsWebProxy.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiDeviceManager.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiG711ClientPlugIn.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiG711Decoder.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiG711Encoder.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiIce.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiMediaCommon.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiMediaPayload.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiMediaTransport.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiNetworkService.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiOs.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiPacketCache.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiPortalSession.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiProtocolStack.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiRateShaper.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiRtp.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiScel.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiScip.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiScipPlugIn.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiSecurity.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiSignaling.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiStun.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiTransport.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiTurn.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiUi.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiUiClient.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiUtils.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiVideoClientPlugIn.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiVideoCodecCommon.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiVideoCommon.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiVideoPayload.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiVp8Payload.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiVp9ClientPlugIn.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiVp9CodecCommon.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiVp9Common.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiVp9Decoder.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiVp9Encoder.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiVp9Payload.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiWeb.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiXml.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiXmpp.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libLmiXmppPlugIn.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libOpusPlugin.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libRedPlugin.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libSpeexPlugin.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libSrtpPlugIn.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libTlsTransportPlugIn.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libVidyoClient.a",
              "<!(echo $VIDYO_CLIENT_LIB_DIR)/libVp8ClientPlugIn.a",
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
                        'destination': '<(module_root_dir)/build/Debug',
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
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiAnalytics",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiAudioCommon",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCalendar",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiClient",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCmcp",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCmcpPlugIn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiConferenceUi",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCsConfClient",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCsConfData",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCsConfMsg",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCsConnMgr",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCsContactMgr",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCsEmcp",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCsEpClient",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCsTls",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCsUtils",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCsVidyoProxy",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiCsWebProxy",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiDeviceManager",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiG711ClientPlugIn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiG711Decoder",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiG711Encoder",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiIce",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiL16PlugIn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiMediaCommon",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiMediaPayload",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiMediaTransport",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiNetworkService",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiOpusPlugIn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiOs",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiPacketCache",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiPortal",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiPortalPlugIn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiProtocolStack",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiRateShaper",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiRedPlugIn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiRtp",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiScel",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiScip",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiScipPlugIn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiSecurity",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiSignaling",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiSpeexPlugIn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiStun",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiTransport",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiTurn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiUi",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiUiClient",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiUtils",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiVideoClientPlugIn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiVideoCodecCommon",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiVideoCommon",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiVideoPayload",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiVp8ClientPlugIn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiVp8Payload",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiVp9ClientPlugIn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiVp9CodecCommon",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiVp9Common",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiVp9Decoder",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiVp9Encoder",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiVp9Payload",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiWeb",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiXml",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiXmpp",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\LmiXmppPlugIn",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\SrtpPlugin",
            "-l<!(echo %VIDYO_CLIENT_LIB_DIR%)\\TlsTransportPlugin",
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
                    "action": ["eval", "install_name_tool -change @executable_path/../Frameworks/BNBEffectPlayerC.framework/Versions/A/BNBEffectPlayerC <!(echo $VIDYO_CLIENT_LIB_DIR)/Banuba/BNBEffectPlayerC.framework/Versions/A/BNBEffectPlayerC ./build/Debug/VidyoAddon.node"],
                 },
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
                  {
                        'variables': {
                         'source_dir' : '<(module_root_dir)\\VidyoClient-WinVS2017SDK\\javascript',
                         'dest_dir' : '<(module_root_dir)\\connector\\lib\\javascript',
                     },
                    "action_name": "post_build_event",
                    "message": "Copy Javascript Bindings folder..",
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

