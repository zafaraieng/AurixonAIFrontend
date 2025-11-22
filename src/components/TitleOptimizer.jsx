import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Chip, CircularProgress } from '@mui/material';
import axios from 'axios';

const TitleOptimizer = () => {
    const [rawTitle, setRawTitle] = useState('');
    const [optimizedContent, setOptimizedContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleOptimize = async () => {
        if (!rawTitle.trim()) {
            setError('Please enter a title to optimize');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/ai/optimize', { rawTitle });
            setOptimizedContent(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to optimize content');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom>
                🧠 Title & Description Optimizer
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <TextField
                    fullWidth
                    label="Enter Your Raw Title"
                    value={rawTitle}
                    onChange={(e) => setRawTitle(e.target.value)}
                    placeholder="e.g., my travel vlog in lahore"
                    margin="normal"
                />

                <Button
                    variant="contained"
                    onClick={handleOptimize}
                    disabled={loading || !rawTitle.trim()}
                    sx={{ mt: 2 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Optimize Content'}
                </Button>

                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
            </Paper>

            {optimizedContent && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Optimized Results
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="primary">
                            Optimized Title:
                        </Typography>
                        <Typography variant="body1">
                            {optimizedContent.optimizedTitle}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" color="primary">
                            Description:
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                            {optimizedContent.description}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            Tags:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {optimizedContent.tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default TitleOptimizer;
