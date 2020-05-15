# Set the script working directory to the input folder
# Necessary to make the Resolve-Path call work as intended
Set-Location ($PSScriptRoot + "\images\raw_tiles")

Workflow Go-Parallel {
  # Script root needs to be passed as a parameter as $PSScriptRoot can't be accessed inside a Workflow
  param([string]$ScriptRoot)

  # The Guetzli exe should be in the same directory where the script is saved
  # To download or build Guetzli visit the Github repository https://github.com/google/guetzli
	$command = $ScriptRoot + "\guetzli.exe"
	# Directory where the uncompressed tiles are saved
  $in_path = $ScriptRoot + "\images\raw_tiles"
  # Output directory for the compressed tiles
	$out_path = $ScriptRoot + "\images\map"
  
  # Clean the output directory
  Remove-Item $out_path -Recurse
  $null = New-Item -ItemType Directory -Force -Path $out_path
  Write-Output "Cleaned output directory"

  # Get all jpeg files in the input directory, recurring into sub-directories
	$files = Get-ChildItem $in_path -Recurse -Filter *.jpg	
	
  # Call to Guetzli are made in parallel to speed up the process, as it is a very resource intensive software
  # Change the argument of ThrottleLimit to the number of CPU threads you want to use
	ForEach -Parallel -ThrottleLimit 3 ($file in $files) {
    # Get the path of the tile relative to the root folder for uncompressed tiles
    # Substring removes the .\ at the start of the path
		$relativePath = ($file | Resolve-Path -Relative)
    $relativePath = $relativePath.Substring(2, $relativePath.length-2)
    # The location where the compressed tile should be placed
		$newName = $out_path + "\" + $relativePath
		
    # Create directories in the output folder, as Guetzli can't create directories 
		$dirName = $newName.Substring(0, $newName.LastIndexOf('\'))
		If(!(test-path $dirName)) {
      $null1 = New-Item -ItemType Directory -Force -Path $dirName
      Write-Output ("Created directory " + $dirName)
		}

    # Call to Guetzli exe
		$params = $file.FullName, $newName
		InlineScript { 
			& $Using:command $Using:params
		}
    Write-Output ("Processing file " + $relativePath)
	}
}
$time = Measure-Command { Go-Parallel -ScriptRoot $PSScriptRoot }
Write-Output ("Done in " + $time)
PAUSE