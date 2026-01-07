# Proposal ~ Project Files

## Motivation

- Project files should not use more system resources than necessary.
- Users should be able to share project files.
- Users should be able to update image crops easily.
- Version control for projects should be a first-class use case.
- Users should be able to export custom sets for use with other software.

## Current behavior

- Uncompressed, unresized card art image files are embedded into set files as base64
   or binary in the case of MSGPACK.
- Set files can be saved as YML (.yml), JSON (.json), or MSGPACK (.msgpack).
- Sharing set files is easy, but set files can get very large.
- Images can be re-cropped - cropping is a non-destructive operation.
- Version control for set files is inconvenient or ineffective.
- There is no system for third party exporters.

## Proposed solution

This proposal suggests:

- Standardizing to YAML (.yml) files for project files, and using the extension `.cmproj`.
- Referencing images on the user's local filesystem instead of embedding them
- Alerting the user to missing assets when a set file is loaded through a dialog.
- Having a set configuration option to move/copy images to live alongside the set file
  in a folder, with a default for new sets configurable at the application level.
- Having an option to "Share" a set, which stores a `.cmproj` file and all images in a
  compressed archive.
- Building a system like the existing card part module system for "exporters".
  - The details of this system will be managed in a separate proposal.

Another option to consider is to display a modal when the user creates a project from 
which they can specify whether the project style should be "Loose" or "Embedded", with 
a few bullet points comparing them.

### Standards

#### Video Editing Software
Video editing software like Premiere and Sony Vegas use project files with extensions
like `.prproj` or `.veg` to associate the file with their software. These files do not
embed referenced assets, they instead reference the assets on the filesystem, and the
software alerts users when an asset could not be found. The user is given multiple
options to resolve missing assets, including providing a folder to search, ignoring
the missing assets, or browsing for files individually.

#### Integrated Development Environments
IDEs like Visual Studio generally have a base `.vcproj` file, alongside which there 
are multiple folders which contain multiple files. The project file in these cases 
only stores settings/configuration.

#### Magic Set Editor
- Saves project files with an `.mse-set` extension.
- Embeds compressed and cropped images in the project file as its default behavior.
- Performs a destructive crop and compression operation on art image selection.
  Re-cropping an image is not possible without browsing and re-selecting the image from
  the user's filesystem.
- Has an option to save a project as a directory, which saves the cropped images from
  cards into a folder.
  - It also may save individual card data, set info, and other data as separate files
    as of a recent version.
  - Files saved this way lack extensions, which creates friction against manual editing.

### Risks and tradeoffs
- *What security considerations are there for this solution?*
  - There are no major security trade-offs between different project file 
    architectures to my knowledge. Reviewers with more extensive knowledge are 
    encouraged to call out concerns I may be missing.
- *What user pain does this solution solve?*
  - Users care about their hard drive space, this minimizes that cost. 
  - Power users want to be empowered to make choices about how their set files are stored.
  - Technical users benefit from using version control to manage their projects.
- *What user pain could this solution create?*
  - Users could share a `.cmproj` file, thinking it includes card images.
- *What maintenance burdens could this solution introduce?*
  - The largest maintenance burden will be whatever system is responsible for creating 
    or loading an archive file. The options need to be carefully considered for this 
    in order to avoid later issues.
- *How does the solution balance simplicity and functionality?*
  - This solution is largely geared towards functionality, and takes on a decent 
    amount of complexity to empower users to make their own choices. I think that 
    complexity is probably worth it for something as integral as how project files are 
    stored on the user's hard drive, but the simpler alternatives listed below may be 
    worthy of some consideration.

## Alternative solutions

### `.cmproj` only
This would mean users would be responsible for packaging their set into a .zip file if 
they wanted to share it. This makes sharing sets slightly more technical, but it is 
actually more accurate to how a lot of modern software actually operates. This would 
also alleviate a lot of the technical requirements for this proposal, making it much 
easier to execute and maintain.

### `.cmset` only
This is basically "keep current functionality". This would mean version control is 
not a well-supported option, but sharing is kept extremely simple. I don't think this 
is a good option because I think version control is valuable and not over-utilizing 
disk space seems more considerate and preferred by users.

## Open questions

### `.zip` or `.cmset`?
Should the compressed, ready-to-share archive have a specific extension like `.cmset`
so it can be directly opened with the software, or should it be just a `.zip` file
which the user has to extract themselves?

- Advantages to `.zip`: 
  - We're not hiding what the file really is.
  - The user can easily extract it where they want the project to be located.
  - We get to write less code and only have to associate with `.cmproj` files.
- Advantages to `.cmset` (or similar):
  - The user can just double-click the file to open it.
  - What happens if they try to save changes? Do we save them directly to the same 
    `.cmset` file?

### ZIP or TAR?
Technically, TAR files have a number of technical advantages over ZIP files for our 
use case. Because the majority of the space in the archive we produce is going to be 
already compressed images, there isn't a strong case to be made for any kind of 
compression. Compression here would waste CPU cycles to save 1-2% on the total archive
size, which isn't a good tradeoff. So we're looking at either a ZIP archive with STORE 
compression or a TAR file. TAR files have the advantage of being sequentially written and
simpler than ZIP files, which means they are more robust against corruption and errors.
The key disadvantage of TAR files is they aren't as familiar or common as ZIP archives, 
especially to Windows users.

### Is anything missing?
Is there a use case or feature around project file architecture that isn't mentioned in 
this proposal?

### Should we worry about users trying to share a `.cmproj` file without images?
What mitigation strategies could we use to help non-technical users avoid this mistake?
