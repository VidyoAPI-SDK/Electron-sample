#include <nan.h>
#include "Lmi/VidyoClient/VidyoClientElectron.h"
#include "Lmi/Os/LmiMallocAllocator.h"
#include <string>

void VidyoAddonInit(const Nan::FunctionCallbackInfo<v8::Value>& args)
{
    if (VidyoClientElectronInit())
        args.GetReturnValue().Set(Nan::New(true));
    else
        args.GetReturnValue().Set(Nan::New(false));
}

void VidyoAddonUninit(const Nan::FunctionCallbackInfo<v8::Value>& args)
{
  VidyoClientElectronUninit();
}

void VidyoAddonDispatch(const Nan::FunctionCallbackInfo<v8::Value>& args)
{
  Nan::Utf8String data(args[0]);
  std::string request(*data);
  LmiString requestSt;
  LmiString responseSt;
  LmiAllocator *alloc;

  alloc = LmiMallocAllocatorGetDefault(); 
  LmiStringConstructCStr(&requestSt, request.c_str(), alloc);
  LmiStringConstructDefault(&responseSt, alloc);
  VidyoClientElectronDispatch(&requestSt, &responseSt);

  args.GetReturnValue().Set(Nan::New(LmiStringCStr(&responseSt)).ToLocalChecked());
}

void init(v8::Local<v8::Object> exports, v8::Local<v8::Value> module, v8::Local<v8::Context> context) {
    Nan::Set(exports,
        Nan::New("VidyoAddonInit").ToLocalChecked(),
        Nan::GetFunction(Nan::New<v8::FunctionTemplate>(VidyoAddonInit)).ToLocalChecked()
    );

    Nan::Set(exports,
        Nan::New("VidyoAddonUninit").ToLocalChecked(),
        Nan::GetFunction(Nan::New<v8::FunctionTemplate>(VidyoAddonUninit)).ToLocalChecked()
    );

    Nan::Set(exports,
        Nan::New("VidyoAddonDispatch").ToLocalChecked(),
        Nan::GetFunction(Nan::New<v8::FunctionTemplate>(VidyoAddonDispatch)).ToLocalChecked()
    );
}

NODE_MODULE_CONTEXT_AWARE(VidyoAddon, init)

