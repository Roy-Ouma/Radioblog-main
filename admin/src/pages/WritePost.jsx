import {
  Button,
  Select,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import useStore from "../store";
import { createSlug, uploadFile } from "../utils";
import { CATEGORIES } from "../utils/constants";

import { Link, RichTextEditor } from "@mantine/tiptap";
import { IconColorPicker } from "@tabler/icons-react";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BiImages } from "react-icons/bi";
import { Toaster, toast } from "sonner";
import Loading from "../components/Loading";
import { useCreatePost } from "../hooks/post-hook";

const WritePost = () => {
  const { colorScheme } = useMantineColorScheme();

  const { user } = useStore();
  const [visible, { toggle }] = useDisclosure(false);
  const { isPending, mutate } = useCreatePost(toast, toggle, user?.token);

  const [category, setCategory] = useState("NEWS");
  const [title, setTitle] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const theme = colorScheme === "dark";

  let editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write post here...." }),
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
  });

  const handleSubmit = async () => {
    if (isUploading) {
      toast.error("Please wait for the image upload to finish.");
      return;
    }
    
    if (!title || title.trim().length === 0) {
      toast.error("Post title is required.");
      return;
    }
    
    if (!fileURL) {
      toast.error("Post image is required.");
      return;
    }
    
    if (!category) {
      toast.error("Category is required.");
      return;
    }
    
    const contentText = editor?.getText().trim();
    if (!contentText || contentText.length === 0) {
      toast.error("Post content is required.");
      return;
    }

    mutate({
      title,
      slug: createSlug(title),
      cat: category,
      img: fileURL,
      desc: editor.getHTML(),
    });
  };

  useEffect(() => {
    return () => {
      if (uploadPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(uploadPreview);
      }
    };
  }, [uploadPreview]);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setUploadError("");
    setUploadProgress(0);

    if (!selectedFile.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (jpg, png).");
      event.target.value = "";
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be under 5MB.");
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setUploadPreview(previewUrl);
    setIsUploading(true);

    try {
      const url = await uploadFile(selectedFile, {
        onProgress: (progress) => setUploadProgress(progress),
      });
      setUploadProgress(100);
      setUploadError("");
      setFileURL(url);
      setUploadPreview(url);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Image upload failed. Please try again.");
      setFileURL("");
      setUploadPreview("");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <RichTextEditor editor={editor}>
        <div className='w-full  flex flex-col md:flex-row flex-wrap gap-5 mb-8'>
          <TextInput
            withAsterisk
            label='Post title'
            className='w-full flex-1'
            placeholder='Post title'
            defaultValue={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Select
            label='Category'
            defaultValue={"NEWS"}
            placeholder='Pick Category'
            data={CATEGORIES.map((cat) => ({ label: cat.label, value: cat.value }))}
            onChange={(val) => setCategory(val || "NEWS")}
          />

          <div className='flex flex-col gap-2'>
            <label
              className='flex items-center gap-2 text-base cursor-pointer'
              htmlFor='imgUpload'
            >
              <input
                type='file'
                onChange={handleFileSelect}
                className='hidden'
                id='imgUpload'
                accept='.jpg,.jpeg,.png'
              />
              <BiImages />
              <span>{isUploading ? "Uploading…" : "Post Image"}</span>
            </label>
            {uploadPreview && (
              <img
                src={uploadPreview}
                alt='Post preview'
                className='w-32 h-32 object-cover rounded border'
              />
            )}
            {uploadError && (
              <span className='text-sm text-red-500'>{uploadError}</span>
            )}
            {isUploading && (
              <span className='text-sm text-gray-500'>{uploadProgress.toFixed(0)}% uploaded</span>
            )}
            {!isUploading && uploadProgress >= 100 && fileURL && (
              <span className='text-sm text-green-600'>Upload complete.</span>
            )}
          </div>
        </div>

        {editor && (
          <BubbleMenu editor={editor}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Link />
            </RichTextEditor.ControlsGroup>
          </BubbleMenu>
        )}

        <RichTextEditor.Toolbar sticky stickyOffset={20}>
          <RichTextEditor.ColorPicker
            colors={[
              "#25262b",
              "#868e96",
              "#fa5252",
              "#e64980",
              "#be4bdb",
              "#7950f2",
              "#4c6ef5",
              "#228be6",
              "#15aabf",
              "#12b886",
              "#40c057",
              "#82c91e",
              "#fab005",
              "#fd7e14",
            ]}
          />
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Control interactive={true}>
              <IconColorPicker size='1rem' stroke={1.5} />
            </RichTextEditor.Control>
            <RichTextEditor.Color color='#F03E3E' />
            <RichTextEditor.Color color='#7048E8' />
            <RichTextEditor.Color color='#1098AD' />
            <RichTextEditor.Color color='#37B24D' />
            <RichTextEditor.Color color='#F59F00' />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.UnsetColor />

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
            <RichTextEditor.Code />
            <RichTextEditor.CodeBlock />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content className='py-8' />
      </RichTextEditor>

      <div className='w-full flex items-end justify-end mt-6'>
        <Button
          className={theme ? "bg-blue-600" : "bg-black"}
          onClick={handleSubmit}
          disabled={isPending || isUploading}
        >
          {isPending ? "Submitting..." : isUploading ? "Uploading..." : "Submit Post"}
        </Button>
      </div>

      <Loading visible={isPending} />
      <Toaster richColors />
    </>
  );
};

export default WritePost;
