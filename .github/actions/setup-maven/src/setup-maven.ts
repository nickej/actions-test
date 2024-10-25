// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env["RUNNER_TEMPDIRECTORY"] || ""

import * as core from "@actions/core"
import * as tc from "@actions/tool-cache"
import * as path from "path"

if (!tempDirectory) {
  let baseLocation: string
  if (process.platform === "win32") {
    baseLocation = process.env["USERPROFILE"] || "C:\\"
  } else {
    if (process.platform === "darwin") {
      baseLocation = "/Users"
    } else {
      baseLocation = "/home"
    }
  }
  tempDirectory = path.join(baseLocation, "actions", "temp")
}

async function getMaven(version: string) {
  let toolPath: string
  toolPath = tc.find("maven", version)

  if (!toolPath) {
    toolPath = await downloadMaven(version)
  }

  toolPath = path.join(toolPath, "bin")

  console.log(`toolpath: ${toolPath}`)

  core.addPath(toolPath)
}

async function downloadMaven(version: string): Promise<string> {
  const toolDirectoryName = `apache-maven-${version}`
  
  const downloadUrl = `https://dlcdn.apache.org/maven/maven-3/${version}/binaries/apache-maven-${version}-bin.tar.gz`
  console.log(`downloading ${downloadUrl}`)

  try {
    const downloadPath = await tc.downloadTool(downloadUrl)
    const extractedPath = await tc.extractTar(downloadPath)
    let toolRoot = path.join(extractedPath, toolDirectoryName)
    return await tc.cacheDir(toolRoot, "maven", version)
  } catch (err) {
    throw err
  }
}

async function run() {
  try {
    let version = core.getInput("version")
    if (version) {
      await getMaven(version)
    }
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

console.log("Running setup-maven")

run()

console.log("setup-maven done")
