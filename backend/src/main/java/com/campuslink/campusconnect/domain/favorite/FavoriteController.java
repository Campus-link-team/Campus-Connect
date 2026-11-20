package com.campuslink.campusconnect.domain.favorite;

import com.campuslink.campusconnect.global.security.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    // POST /api/v1/books/{bookPostId}/favorite
    @PostMapping("/{bookPostId}/favorite")
    public ResponseEntity<String> toggleFavorite(
            @PathVariable Long bookPostId,
            @LoginUser Long userId) {
        String resultMessage = favoriteService.toggleFavorite(bookPostId, userId);
        return ResponseEntity.ok(resultMessage);
    }
}