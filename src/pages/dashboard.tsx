import React, { useState } from 'react';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear'; 
import ReactDiffViewer  from 'react-diff-viewer-continued';
import CodeDiff from '../components/codediff';


enum Models {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4 = 'gpt-4',
}

const Dashboard = () => {
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [command, setCommand] = useState('');
  const [model, setModel] = useState<Models>(Models.GPT_3_5_TURBO);
  const [fileContent, setFileContent] = useState<string>('');
  const [responseData, setResponseData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const isSupported = 'showOpenFilePicker' in window;

  React.useEffect(() => {
    const savedState = localStorage.getItem('dashboardState');
    if (savedState) {
      const { command } = JSON.parse(savedState);
      setCommand(command);
    }
  }, []);

  const selectFile = async () => {
    if (!isSupported) return;

    try {
      const [handle] = await window.showOpenFilePicker!({
        types: [
          {
            description: 'Text Files',
            accept: {
              'text/plain': ['.txt'],
            },
          },
        ],
      });
      if (handle) {
        setFileHandle(handle);
        readFileContent(handle);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      alert('Error selecting file. See console for details.');
    }
  };

  const readFileContent = async (handle: FileSystemFileHandle) => {
    try {
      const file = await handle.getFile();
      const text = await file.text();
      setFileContent(text);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. See console for details.');
    }
  };

  const refreshFileContent = () => {
    if (fileHandle) {
      readFileContent(fileHandle);
    } else {
      alert('No file selected. Please select a file first.');
    }
  };

  const clearFileContent = () => {
    setFileHandle(null);
    setFileContent('');
  };

  const updateFile = async (newContent: string) => {
    if (!fileHandle) {
      alert('No file selected. Please select a file first.');
      return;
    }
  
    try {
      // Create a FileSystemWritableFileStream to write to.
      const writable = await fileHandle.createWritable();
  
      // Write the new content to the file.
      await writable.write(newContent);
  
      // Close the file and write the contents to disk.
      await writable.close();
  
      // Optionally, update the fileContent state to reflect the new content
      // This is useful if your application displays the file content and you want it to be up to date.
      setFileContent(newContent);
  
      alert('File updated successfully.');
    } catch (error) {
      console.error('Error updating file:', error);
      alert('Error updating file. See console for details.');
    }
  };
  

  const submitData = async () => {
    if (!fileContent) {
      alert('No file content available. Please select a file and ensure it has content.');
      return;
    }

    const apiUrl = process.env.REACT_APP_API_BASE_URL || '';
    if (!apiUrl) {
      console.error('API URL not set.');
      return;
    }

    const payload = {
      model,
      context: fileContent,
      command,
    };

    try {
      setIsLoading(true); // Set loading to true
      const response = await fetch(apiUrl + '/process_command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data)
      setResponseData(data);
      setError(null);
      console.log(data); // Handle the response data as needed
      alert('Data submitted successfully');

      // Save to local storage before the API call
      localStorage.setItem('dashboardState', JSON.stringify({ command }));

    } catch (error) {
      setError('Error submitting data: ' + error);
      console.error('Error submitting data:', error);
      alert('Error submitting data. See console for details.');
    } finally {
      setIsLoading(false); // Set loading back to false after request completes
    }
  };

  if (!isSupported) {
    return (
      <Container>
        <Typography variant="body1" color="error">
          The File System Access API is not supported in this browser.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginRight: 2,
            }}
          >
            <Typography variant="button">Context:</Typography>
            <Box
              sx={{
                flexGrow: 1,
              }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={fileHandle ? <DescriptionIcon /> : <FolderOpenIcon />}
            onClick={selectFile}
          >
            {fileHandle ? `Selected: ${fileHandle.name}` : 'Select File'}
          </Button>
          <Button
            variant="text"
            startIcon={<ClearIcon />}
            onClick={clearFileContent}
            disabled={!fileHandle}
            sx={{ ml: 2}} 
          >
            Clear
          </Button>
        </AccordionSummary>
        <AccordionDetails sx={{ flexDirection: 'column' }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
            {fileContent || 'No file content to display.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={refreshFileContent}
            disabled={!fileHandle}
            sx={{ mb: 2 }}
          >
            Refresh File Content
          </Button>
        </AccordionDetails>
      </Accordion>

      <FormControl fullWidth sx={{ my: 2 }}>
        <InputLabel id="model-select-label">Model</InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={model}
          label="Model"
          onChange={(e) => setModel(e.target.value as Models)}
        >
          <MenuItem value={Models.GPT_4}>GPT-4</MenuItem>
          <MenuItem value={Models.GPT_3_5_TURBO}>GPT-3.5 Turbo</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Command"
        variant="outlined"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        sx={{ mb: 2, overflow: 'auto' }}
      />

      {isLoading && <CircularProgress sx={{ mt: 2, mb: 1 }} />} {/* Show spinner when API request is active */}
      {!isLoading && <Button
        variant="contained"
        color="primary"
        onClick={submitData}
        disabled={!model || !fileHandle || !command}
      >
        Submit
      </Button>}

      {fileContent && responseData?.modified_code && (
        <CodeDiff original={fileContent} modified={responseData.modified_code}  onGetAppliedChanges={updateFile} />
      )}

      {error && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="error">{error}</Typography>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;