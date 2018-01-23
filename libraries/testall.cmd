@echo off
echo setting test keys
call \\fusebox\private\sdk\UnitTestKeys.cmd
echo starting storage emulator
@if exist "%ProgramFiles(x86)%\Microsoft SDKs\Azure\Storage Emulator\azurestorageemulator.exe" (
  "%ProgramFiles(x86)%\Microsoft SDKs\Azure\Storage Emulator\azurestorageemulator.exe" start
) else (
  @echo You don't have Azure Storage Emulator installed
  @echo go to https://go.microsoft.com/fwlink/?LinkId=717179 to download and install 
)
echo mocha tests for: botbuilder
cd botbuilder
call npm run test
echo mocha tests for: botbuilder-middleware
cd ..\botbuilder-middleware
call npm run test
echo mocha tests for: botbuilder-stylers
cd ..\botbuilder-stylers
call npm run test
echo mocha tests for: botbuilder-node
cd ..\botbuilder-node
call npm run test
echo mocha tests for: botbuilder-ai
cd ..\botbuilder-ai 
call npm run test
echo mocha tests for: botbuilder-azure
cd ..\botbuilder-azure 
call npm run test
echo mocha tests for: botbuilder-choices
cd ..\botbuilder-choices
call npm run test
echo mocha tests for: botbuilder-legacy

:end
cd ..
echo mocha tests complete
