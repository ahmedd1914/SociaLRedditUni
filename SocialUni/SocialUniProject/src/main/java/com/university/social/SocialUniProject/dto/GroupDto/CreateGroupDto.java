package com.university.social.SocialUniProject.dto.GroupDto;

import com.university.social.SocialUniProject.models.Enums.Category;
import com.university.social.SocialUniProject.models.Enums.Visibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateGroupDto {

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    // Replace isPrivate with a Visibility field.
    private Visibility visibility = Visibility.PUBLIC;

    private Category category;
}
